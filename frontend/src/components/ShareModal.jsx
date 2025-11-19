import { useState } from 'react';
import { X, Share2, Copy, Check, Globe } from 'lucide-react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { toggleFilePublicTransaction } from '../services/sui';

function ShareModal({ file, onClose, onSuccess }) {
  const [copied, setCopied] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [updating, setUpdating] = useState(false);

  const shareUrl = file.isPublic 
    ? `${window.location.origin}/share/${file.id}`
    : null;

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTogglePublic = async () => {
    setUpdating(true);
    try {
      const tx = toggleFilePublicTransaction(file.id);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setUpdating(false);
            onSuccess();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            alert('Failed to update file: ' + error.message);
            setUpdating(false);
          }
        }
      );
    } catch (error) {
      console.error('Failed to toggle public:', error);
      alert('Failed to update file');
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary-500" />
            <h3 className="text-xl font-bold text-white">Share File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={updating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {file.isPublic ? (
              <Globe className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 flex-shrink-0" />
            )}
          </div>

          {/* Public Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-white">Public Access</p>
                <p className="text-sm text-gray-400">
                  {file.isPublic 
                    ? 'Anyone with the link can view' 
                    : 'Only you can access this file'}
                </p>
              </div>
              <button
                onClick={handleTogglePublic}
                disabled={updating}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  file.isPublic ? 'bg-primary-600' : 'bg-gray-700'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    file.isPublic ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Share Link */}
            {file.isPublic && shareUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Anyone with this link can view and download this file
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            disabled={updating}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
