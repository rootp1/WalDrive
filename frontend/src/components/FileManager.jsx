import { useState } from 'react';
import { Upload, Grid, List, FolderPlus } from 'lucide-react';
import UploadModal from './UploadModal';
import FolderModal from './FolderModal';
import FileGrid from './FileGrid';
import FileList from './FileList';
import { useUserFiles, useUserFolders } from '../hooks/useSuiData';

function FileManager({ currentFolder, onFolderOpen }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const { files: allFiles, loading: filesLoading, refetch: refetchFiles } = useUserFiles();
  const { folders: allFolders, loading: foldersLoading, refetch: refetchFolders } = useUserFolders();
  const loading = filesLoading || foldersLoading;

  // Filter files and folders based on current folder
  const files = allFiles.filter(file => {
    if (currentFolder) {
      return file.folderId === currentFolder.id;
    }
    return !file.folderId; // Root level files (no folder)
  });

  const folders = allFolders.filter(folder => {
    if (currentFolder) {
      return folder.parentId === currentFolder.id;
    }
    return !folder.parentId; // Root level folders (no parent)
  });

  const onRefresh = () => {
    refetchFiles();
    refetchFolders();
  }; 
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {currentFolder ? currentFolder.name : 'My Drive'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {files.length} files • {folders.length} folders
            {currentFolder && <span className="text-primary-500"> • In folder</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {/* Action Buttons */}
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : files.length === 0 && folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Upload className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No files yet</h3>
          <p className="text-gray-500 mb-4">Upload your first file to get started</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
          >
            Upload Files
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <FileGrid
          files={files}
          folders={folders}
          onRefresh={onRefresh}
          onFolderOpen={onFolderOpen}
        />
      ) : (
        <FileList
          files={files}
          folders={folders}
          onRefresh={onRefresh}
          onFolderOpen={onFolderOpen}
        />
      )}
      {/* Modals */}
      {showUpload && (
        <UploadModal
          currentFolder={currentFolder}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            // Only refresh, don't close modal (modal handles its own state)
            onRefresh();
          }}
        />
      )}
      {/* Folder Modal */}
      {showFolderModal && (
        <FolderModal
          currentFolder={currentFolder}
          onClose={() => setShowFolderModal(false)}
          onSuccess={() => {
            setShowFolderModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
export default FileManager;
