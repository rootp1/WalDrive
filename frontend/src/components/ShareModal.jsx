import { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Plus, Trash2, UserPlus } from 'lucide-react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { toggleFilePublicTransaction, createShareCapabilityTransaction } from '../services/sui';

function ShareModal({ file, onClose, onSuccess }) {
  const [copied, setCopied] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const [updating, setUpdating] = useState(false);
  const [sharedAddresses, setSharedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [sharing, setSharing] = useState(false);

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

  const handleAddAddress = () => {
    const trimmedAddress = newAddress.trim();
    
    if (trimmedAddress && /^0x[a-fA-F0-9]{64}$/.test(trimmedAddress)) {
      if (!sharedAddresses.includes(trimmedAddress)) {
        setSharedAddresses([...sharedAddresses, trimmedAddress]);
        setNewAddress('');
      } else {
        alert('This address is already added');
      }
    } else {
      alert('Please enter a valid Sui address (0x followed by 64 hex characters)');
    }
  };

  const handleRemoveAddress = (address) => {
    setSharedAddresses(sharedAddresses.filter(addr => addr !== address));
  };

  const handleShareWithAddresses = async () => {
    if (sharedAddresses.length === 0) {
      alert('Please add at least one address to share with');
      return;
    }

    setSharing(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sharedAddresses.length; i++) {
      try {
        const shareTx = createShareCapabilityTransaction(
          file.id,
          sharedAddresses[i],
          false, 
          false  
        );

        await new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: shareTx },
            {
              onSuccess: async (result) => {
                try {
                  await suiClient.waitForTransaction({
                    digest: result.digest,
                    options: { showEffects: true }
                  });
                  successCount++;
                  resolve();
                } catch (err) {
                  reject(err);
                }
              },
              onError: (err) => reject(err)
            }
          );
        });
      } catch (shareError) {
        console.error(`Failed to share with ${sharedAddresses[i]}:`, shareError);
        failCount++;
      }
    }

    setSharing(false);
    
    if (successCount > 0) {
      alert(`Successfully shared with ${successCount} address(es)${failCount > 0 ? `, failed for ${failCount}` : ''}`);
      setSharedAddresses([]);
      onSuccess();
    } else {
      alert('Failed to share with any addresses');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800 animate-slideUp">
        {}
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

        {}
        <div className="p-6 space-y-4">
          {}
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

          {}
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

            {}
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

          {}
          {!file.isPublic && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <UserPlus className="w-5 h-5" />
                <h4 className="font-medium">Share with Specific Addresses</h4>
              </div>
              
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="0x... (Sui wallet address)"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-600"
                    disabled={updating || sharing}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAddress();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                    disabled={updating || sharing || !newAddress.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Grant view-only access to specific wallet addresses
                </p>
              </div>

              {}
              {sharedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">
                    Will share with ({sharedAddresses.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {sharedAddresses.map((address) => (
                      <div
                        key={address}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <p className="text-sm text-white font-mono truncate flex-1 mr-2">
                          {address.slice(0, 10)}...{address.slice(-8)}
                        </p>
                        <button
                          onClick={() => handleRemoveAddress(address)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                          disabled={updating || sharing}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleShareWithAddresses}
                    disabled={sharing || updating}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {sharing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share with {sharedAddresses.length} address{sharedAddresses.length > 1 ? 'es' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            disabled={updating || sharing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
