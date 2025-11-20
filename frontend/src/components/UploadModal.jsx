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
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
      const tx = createFileTransaction(
        file.name,
        blobId,
        file.size,
        file.type,
        currentFolder?.id || null,
        isPublic
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setProgress(100);
            setUploadSuccess(true);
            
            setTimeout(() => {
              // Reset state for next upload
              setFile(null);
              setUploading(false);
              setProgress(0);
              setIsPublic(false);
              setUploadSuccess(false);
              // Trigger refresh without closing modal
              onSuccess();
            }, 1500);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            
            // Check if user cancelled the transaction
            if (error.message?.includes('rejected') || error.message?.includes('User rejected')) {
              console.log('Transaction cancelled by user');
              onClose(); // Auto close on cancellation
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full border border-gray-800 animate-slideUp">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Upload File</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
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
                className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 hover:border-primary-600 transition-colors"
                disabled={uploading}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 text-center">
                  Click to select a file or drag and drop
                </p>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                <File className="w-10 h-10 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{file.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Make file public</p>
              <p className="text-sm text-gray-400">Anyone with the link can view</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary-600' : 'bg-gray-700'
              }`}
              disabled={uploading}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPublic ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">
                  {uploadSuccess ? 'Upload complete!' : 'Uploading to Walrus...'}
                </span>
                <span className="text-white font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadSuccess ? 'bg-green-500' : 'bg-primary-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {uploadSuccess && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  File uploaded successfully! You can upload another file.
                </p>
              )}
            </div>
          )}
        </div>
        {}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default UploadModal;
