import { useState } from 'react';
import { Home, Folder, Plus, FolderPlus } from 'lucide-react';
import { foldersAPI } from '../services/api';
function Sidebar({ isOpen, folders, currentFolder, onFolderSelect, onRefresh }) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreating(true);
    try {
      await foldersAPI.create({
        name: newFolderName,
        parentId: currentFolder?._id || null,
      });
      setNewFolderName('');
      setShowNewFolder(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder');
    } finally {
      setCreating(false);
    }
  };
  if (!isOpen) return null;
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => onFolderSelect(null)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            !currentFolder
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">My Drive</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase">Folders</h3>
          <button
            onClick={() => setShowNewFolder(true)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        {showNewFolder && (
          <form onSubmit={handleCreateFolder} className="mb-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-primary-600 focus:outline-none mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !newFolderName.trim()}
                className="flex-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="space-y-1">
          {folders.filter(f => !f.parent).map((folder) => (
            <button
              key={folder._id}
              onClick={() => onFolderSelect(folder)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                currentFolder?._id === folder._id
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <Folder className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
