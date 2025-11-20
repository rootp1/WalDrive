import { useState } from 'react';
import { X, Folder } from 'lucide-react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createFolderTransaction } from '../services/sui';

function FolderModal({ currentFolder, onClose, onSuccess }) {
  const [folderName, setFolderName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleCreate = async () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    setCreating(true);

    try {
      
      const path = currentFolder ? `${currentFolder.path}/${folderName}` : folderName;
      
      const tx = createFolderTransaction(
        folderName,
        path,
        isPublic
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            setCreating(false);
            onSuccess();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            alert('Failed to create folder: ' + error.message);
            setCreating(false);
          }
        }
      );
    } catch (error) {
      console.error('Folder creation failed:', error);
      alert('Folder creation failed: ' + error.message);
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800 animate-slideUp">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Create New Folder</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={creating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="p-6 space-y-4">
          {}
          <div className="flex justify-center">
            <div className="p-4 bg-primary-500/10 rounded-full">
              <Folder className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-primary-600 focus:outline-none text-white"
              disabled={creating}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) {
                  handleCreate();
                }
              }}
            />
          </div>

          {}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Make folder public</p>
              <p className="text-sm text-gray-400">Anyone can view contents</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary-600' : 'bg-gray-700'
              }`}
              disabled={creating}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPublic ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim() || creating}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <Folder className="w-4 h-4" />
                Create Folder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderModal;
