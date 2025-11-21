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
    
    
    if (onProgress) onProgress({ step: 'blockchain', progress: 0.9 });
    
    const tx = createFileTransaction(
      file.name,
      encryptedBlobId,
      encryptedFileKey,
      file.size,
      file.type,
      path,
      isPublic
    );
    
    const result = await signAndExecuteTransaction({ transaction: tx });
    
    if (onProgress) onProgress({ step: 'complete', progress: 1.0 });
    
    return result;
    
  } catch (error) {
    console.error('Secure upload failed:', error);
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
