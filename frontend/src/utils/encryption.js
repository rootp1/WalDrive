// WalDrive Encryption Utility
// Strategy: Encrypt file content + blob_id only (not metadata)


export async function getUserEncryptionKey(signMessage, walletAddress) {
  const message = new TextEncoder().encode(
    `WalDrive Encryption Key\nAddress: ${walletAddress}\nPurpose: Secure file access`
  );
  
  try {
    const { signature } = await signMessage({ message });
    
    
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      signatureBytes.slice(0, 32), 
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    
    const salt = new TextEncoder().encode('waldrive-salt-v1');
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw new Error('User cancelled signature or wallet error');
  }
}


export async function encryptString(plaintext, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(plaintext);
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}


export async function decryptString(encryptedBase64, key) {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );
  
  return new TextDecoder().decode(decryptedData);
}


export async function encryptFile(file, onProgress) {
  
  const fileKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  
  const fileData = await file.arrayBuffer();
  
  
  if (onProgress) onProgress(0.3);
  
  
  const encryptedFile = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    fileKey,
    fileData
  );
  
  if (onProgress) onProgress(0.7);
  
  
  const exportedKey = await crypto.subtle.exportKey('raw', fileKey);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  
  
  const combined = new Uint8Array(iv.length + encryptedFile.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedFile), iv.length);
  
  if (onProgress) onProgress(1.0);
  
  return {
    encryptedBlob: new Blob([combined], { type: 'application/octet-stream' }),
    fileKeyBase64: keyBase64
  };
}


export async function decryptFile(encryptedBlob, fileKeyBase64, originalName, originalMimeType, onProgress) {
  
  const keyBytes = Uint8Array.from(atob(fileKeyBase64), c => c.charCodeAt(0));
  const fileKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  if (onProgress) onProgress(0.2);
  
  
  const combined = await encryptedBlob.arrayBuffer();
  const iv = new Uint8Array(combined.slice(0, 12));
  const encryptedData = combined.slice(12);
  
  if (onProgress) onProgress(0.5);
  
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    fileKey,
    encryptedData
  );
  
  if (onProgress) onProgress(0.9);
  
  
  const decryptedFile = new File([decryptedData], originalName, { 
    type: originalMimeType 
  });
  
  if (onProgress) onProgress(1.0);
  
  return decryptedFile;
}


const CACHE_KEY = 'waldrive_encryption_key_cache';
const CACHE_DURATION = 3600000; 

export function cacheEncryptionKey(walletAddress, keyData) {
  const cache = {
    address: walletAddress,
    keyData: keyData,
    timestamp: Date.now()
  };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getCachedEncryptionKey(walletAddress) {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cache = JSON.parse(cached);
    
    
    if (cache.address !== walletAddress) return null;
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return cache.keyData;
  } catch {
    return null;
  }
}

export function clearEncryptionKeyCache() {
  sessionStorage.removeItem(CACHE_KEY);
}
