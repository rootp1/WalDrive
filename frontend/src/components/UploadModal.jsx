import { useState, useRef } from 'react';
import { X, Upload, File, Check } from 'lucide-react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { uploadToWalrus } from '../services/walrus';
import { createFileTransaction } from '../services/sui';

function UploadModal({ currentFolder, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const fileInputRef = useRef(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      setProgress(30);
      const blobId = await uploadToWalrus(file);
      
      setProgress(60);
      
      const path = currentFolder ? `${currentFolder.path}/${file.name}` : file.name;
      
      const tx = createFileTransaction(
        file.name,
        blobId,
        file.size,
        file.type,
        path,
        isPublic
      );

      setProgress(70); 
      
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            setProgress(80);
            try {
              
              await suiClient.waitForTransaction({
                digest: result.digest,
                options: { showEffects: true }
              });
              setProgress(100);
              
              onSuccess();
            } catch (waitError) {
              console.error('Error waiting for transaction:', waitError);
              
              setProgress(100);
              onSuccess();
            }
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            
            
            if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
              console.log('Transaction cancelled by user');
              onClose(); 
            } else {
              alert('Failed to create file on-chain: ' + error.message);
              setUploading(false);
              setProgress(0);
            }
          }
        }
      );
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
      setUploading(false);
      setProgress(0);
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-lg w-full border border-gray-800/50 animate-scaleIn shadow-2xl">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <h3 className="text-lg font-medium text-gray-100">Upload File</h3>
          <button
            onClick={onClose}
            className="icon-btn"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {}
        <div className="p-6 space-y-4">
          {}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700/50 rounded-xl p-12 hover:border-primary-600/50 hover:bg-[#202020] transition-all duration-200"
                disabled={uploading}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-500/70" />
                </div>
                <p className="text-gray-400 text-center text-sm">
                  Click to select a file or drag and drop
                </p>
                <p className="text-gray-600 text-center text-xs mt-1">
                  Any file type supported
                </p>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#202020] border border-gray-800/50 rounded-lg">
                <File className="w-9 h-9 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-normal text-gray-100 truncate text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setFile(null)}
                    className="icon-btn p-1.5"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            )}
          </div>
          {}
          <div className="flex items-center justify-between p-4 bg-[#202020] border border-gray-800/50 rounded-lg">
            <div>
              <p className="font-normal text-gray-200 text-sm">Make file public</p>
              <p className="text-xs text-gray-500 mt-0.5">Anyone with the link can view</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary-600' : 'bg-gray-700'
              }`}
              disabled={uploading}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  isPublic ? 'transform translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          {}
          {uploading && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400 text-xs">
                  {progress < 60 ? 'Uploading to Walrus...' : 
                   progress < 70 ? 'File uploaded, preparing transaction...' :
                   progress < 80 ? 'Waiting for transaction approval...' :
                   progress < 100 ? 'Finalizing on blockchain...' :
                   'Complete!'}
                </span>
                <span className="text-gray-200 font-medium text-xs">{progress}%</span>
              </div>
              <div className="w-full bg-[#141414] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-600 to-primary-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-800/50">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default UploadModal;
