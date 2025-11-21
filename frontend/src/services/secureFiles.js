// Secure file operations combining encryption and blockchain storage
import { uploadToWalrus, getWalrusUrl } from './walrus';
import { createFileTransaction } from './sui';
import { 
  getUserEncryptionKey, 
  encryptString, 
  decryptString,
  encryptFile,
  decryptFile,
  getCachedEncryptionKey,
  cacheEncryptionKey,
  clearEncryptionKeyCache
} from '../utils/encryption';


export async function uploadSecureFile(
  file,
  path,
  isPublic,
  signMessage,
  signAndExecuteTransaction,
  walletAddress,
  onProgress
) {
  try {
    // Basic upfront validation
    if (!file) throw new Error('No file provided');
    if (typeof file.name !== 'string') throw new Error('File name must be a string');
    if (typeof file.size !== 'number') throw new Error('File size must be numeric');
    if (!walletAddress) throw new Error('Missing wallet address');
    
    if (onProgress) onProgress({ step: 'encrypting', progress: 0.1 });
    
    const { encryptedBlob, fileKeyBase64 } = await encryptFile(
      file,
      (p) => onProgress && onProgress({ step: 'encrypting', progress: 0.1 + p * 0.5 })
    );
    
    
    if (onProgress) onProgress({ step: 'uploading', progress: 0.6 });
    
    const blobId = await uploadToWalrus(encryptedBlob);
    
    if (onProgress) onProgress({ step: 'uploading', progress: 0.8 });
    
    
    if (onProgress) onProgress({ step: 'securing', progress: 0.85 });
    
    let userKey = getCachedEncryptionKey(walletAddress);
    if (!userKey) {
      userKey = await getUserEncryptionKey(signMessage, walletAddress);
      
      const exportedKey = await crypto.subtle.exportKey('raw', userKey);
      const keyData = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      cacheEncryptionKey(walletAddress, keyData);
    } else {
      
      const keyBytes = Uint8Array.from(atob(userKey), c => c.charCodeAt(0));
      userKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    
    const encryptedBlobId = await encryptString(blobId, userKey);
    const encryptedFileKey = await encryptString(fileKeyBase64, userKey);

    // Defensive type checks to avoid argument shifting into Move call
    if (typeof encryptedBlobId !== 'string' || encryptedBlobId.length === 0) {
      throw new Error('Encrypted blob id generation failed');
    }
    if (typeof encryptedFileKey !== 'string' || encryptedFileKey.length === 0) {
      throw new Error('Encrypted file key generation failed');
    }
    if (Number.isNaN(file.size) || file.size < 0) {
      throw new Error('Invalid file size');
    }
    
    
    if (onProgress) onProgress({ step: 'blockchain', progress: 0.9 });
    
    const tx = createFileTransaction(
      file.name,
      encryptedBlobId,
      encryptedFileKey,
      file.size,
      file.type || 'application/octet-stream',
      path || '/',
      !!isPublic
    );

    // Optional: quick dry run (comment out if performance is an issue)
    // try {
    //   const dryRun = await signAndExecuteTransaction({ transaction: tx, onlyDryRun: true });
    //   console.debug('Dry run success:', dryRun);
    // } catch (e) {
    //   console.warn('Dry run failed, aborting before submission:', e);
    //   throw e;
    // }
    
    const result = await signAndExecuteTransaction({ transaction: tx });
    
    if (onProgress) onProgress({ step: 'complete', progress: 1.0 });
    
    return result;
    
  } catch (error) {
    console.error('Secure upload failed:', error);
    // Re-map common error pattern from Sui SDK when string expected but number supplied
    if (/Invalid string value/.test(String(error))) {
      throw new Error('Upload aborted: Argument alignment issue (a non-string slipped into a string position). Please retry; if persists clear cache.');
    }
    throw error;
  }
}


export async function downloadSecureFile(
  fileMetadata,
  signMessage,
  walletAddress,
  onProgress
) {
  try {
    // Legacy fallback: if encrypted fields absent but raw blob_id present, perform direct download without decryption.
    const hasEncrypted = !!fileMetadata?.encrypted_blob_id && !!fileMetadata?.encrypted_file_key;
    const hasRawBlob = !!fileMetadata?.blob_id;
    if (!hasEncrypted && hasRawBlob) {
      // Direct, non-secure path (pre-encryption upload). Warn and stream raw file.
      console.warn('Legacy (unencrypted) file detected. Proceeding without decryption. File ID:', fileMetadata?.id);
      if (onProgress) onProgress({ step: 'downloading', progress: 0.3 });
      const walrusUrl = getWalrusUrl(fileMetadata.blob_id);
      const response = await fetch(walrusUrl);
      if (!response.ok) throw new Error(`Failed to fetch legacy file: ${response.status}`);
      const rawBlob = await response.blob();
      if (onProgress) onProgress({ step: 'complete', progress: 1.0 });
      // Return a File instance matching expected signature.
      return new File([rawBlob], fileMetadata.name, { type: fileMetadata.mime_type || 'application/octet-stream' });
    }
    if (!hasEncrypted) {
      throw new Error('Missing encrypted blob data; cannot download file.');
    }
    
    if (onProgress) onProgress({ step: 'authenticating', progress: 0.1 });
    
    let userKey = getCachedEncryptionKey(walletAddress);
    if (!userKey) {
      userKey = await getUserEncryptionKey(signMessage, walletAddress);
      const exportedKey = await crypto.subtle.exportKey('raw', userKey);
      const keyData = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      cacheEncryptionKey(walletAddress, keyData);
    } else {
      const keyBytes = Uint8Array.from(atob(userKey), c => c.charCodeAt(0));
      userKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    
    if (onProgress) onProgress({ step: 'preparing', progress: 0.2 });
    
    const blobId = await decryptString(fileMetadata.encrypted_blob_id, userKey);
    const fileKeyBase64 = await decryptString(fileMetadata.encrypted_file_key, userKey);
    
    
    if (onProgress) onProgress({ step: 'downloading', progress: 0.3 });
    
    const walrusUrl = getWalrusUrl(blobId);
    const response = await fetch(walrusUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file from Walrus: ${response.status}`);
    }
    
    const encryptedBlob = await response.blob();
    
    if (onProgress) onProgress({ step: 'downloading', progress: 0.6 });
    
    
    if (onProgress) onProgress({ step: 'decrypting', progress: 0.7 });
    
    const decryptedFile = await decryptFile(
      encryptedBlob,
      fileKeyBase64,
      fileMetadata.name,
      fileMetadata.mime_type,
      (p) => onProgress && onProgress({ step: 'decrypting', progress: 0.7 + p * 0.3 })
    );
    
    if (onProgress) onProgress({ step: 'complete', progress: 1.0 });
    
    return decryptedFile;
    
  } catch (error) {
    console.error('Secure download failed:', error);
    throw error;
  }
}


export function clearSecurityCache() {
  clearEncryptionKeyCache();
}
