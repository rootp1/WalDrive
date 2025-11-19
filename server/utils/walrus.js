const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const WALRUS_CLI = process.env.WALRUS_CLI_PATH || '/home/rootp1/.local/bin/walrus';
const WALRUS_CONTEXT = process.env.WALRUS_CONTEXT || 'testnet';
const CACHE_DIR = process.env.CACHE_DIR || path.join(__dirname, '../cache');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`Created cache directory at ${CACHE_DIR}`);
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory at ${UPLOAD_DIR}`);
}
function uploadToWalrus(filePath) {
  return new Promise((resolve, reject) => {
    const epochs = process.env.WALRUS_EPOCHS || '5';
    const cmd = `${WALRUS_CLI} store "${filePath}" --epochs ${epochs} --context ${WALRUS_CONTEXT}`;
    console.log(`[UPLOAD] Uploading to Walrus: ${filePath}`);
    console.log(`[UPLOAD] Executing: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) console.log(`[WALRUS UPLOAD] ${stdout}`);
      if (stderr) console.error(`[WALRUS UPLOAD ERROR] ${stderr}`);
      if (error) {
        console.error(`[UPLOAD FAILED] ${error.message}`);
        return reject(new Error(`Failed to upload to Walrus: ${stderr || error.message}`));
      }
      const blobIdMatch = stdout.match(/Blob ID[:\s]+([A-Za-z0-9_-]+)/i) ||
                         stdout.match(/blob[:\s]+([A-Za-z0-9_-]+)/i) ||
                         stdout.match(/([A-Za-z0-9_-]{43,})/);
      if (blobIdMatch && blobIdMatch[1]) {
        const blobId = blobIdMatch[1];
        console.log(`[UPLOAD SUCCESS] Blob ID: ${blobId}`);
        resolve(blobId);
      } else {
        console.error(`[PARSE ERROR] Could not extract blob ID from output`);
        reject(new Error('Upload may have succeeded but could not parse blob ID'));
      }
    });
  });
}
function downloadFromWalrus(blobId, outputPath = null) {
  return new Promise((resolve, reject) => {
    if (!outputPath) {
      outputPath = path.join(CACHE_DIR, `${blobId}.png`);
    }
    if (fs.existsSync(outputPath)) {
      console.log(`[VIEW] Serving from cache: ${blobId}`);
      return resolve(outputPath);
    }
    const cmd = `${WALRUS_CLI} read ${blobId} --context ${WALRUS_CONTEXT} --out "${outputPath}"`;
    console.log(`[VIEW] Fetching blob from Walrus: ${blobId}`);
    console.log(`[VIEW] Executing: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) console.log(`[WALRUS READ] ${stdout}`);
      if (stderr) console.error(`[WALRUS READ ERROR] ${stderr}`);
      if (error) {
        console.error(`[VIEW FAILED] ${error.message}`);
        return reject(new Error(`Failed to fetch blob from Walrus: ${stderr || error.message}`));
      }
      if (!fs.existsSync(outputPath)) {
        console.error(`[VIEW FAILED] File not created at ${outputPath}`);
        return reject(new Error('Blob fetched but file not found'));
      }
      console.log(`[VIEW SUCCESS] Blob fetched and cached: ${blobId}`);
      resolve(outputPath);
    });
  });
}
function deleteCachedFile(blobId) {
  const cachedPath = path.join(CACHE_DIR, `${blobId}.png`);
  try {
    if (fs.existsSync(cachedPath)) {
      fs.unlinkSync(cachedPath);
      console.log(`[CACHE] Deleted cached file: ${blobId}`);
    }
  } catch (error) {
    console.log(`[CACHE] Error deleting file: ${error.message}`);
  }
}
function getAggregatorUrl(blobId) {
  const aggregator = process.env.WALRUS_AGGREGATOR || 'https:
  return `${aggregator}/v1/blobs/${blobId}`;
}
module.exports = {
  uploadToWalrus,
  downloadFromWalrus,
  deleteCachedFile,
  getAggregatorUrl,
  CACHE_DIR,
  UPLOAD_DIR,
};
