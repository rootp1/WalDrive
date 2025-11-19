import { WALRUS_CONFIG } from '../config/contracts';

export const uploadToWalrus = async (file) => {
  const response = await fetch(`${WALRUS_CONFIG.PUBLISHER_URL}/v1/blobs?epochs=${WALRUS_CONFIG.EPOCHS}`, {
    method: 'PUT',
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Walrus upload error:', response.status, errorText);
    throw new Error(`Failed to upload to Walrus: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  if (result.newlyCreated) {
    return result.newlyCreated.blobObject.blobId;
  } else if (result.alreadyCertified) {
    return result.alreadyCertified.blobId;
  }
  
  throw new Error('Unexpected Walrus response');
};

export const getWalrusUrl = (blobId) => {
  return `${WALRUS_CONFIG.AGGREGATOR_URL}/v1/blobs/${blobId}`;
};
