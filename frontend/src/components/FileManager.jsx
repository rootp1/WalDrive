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

  
  const currentPath = currentFolder ? currentFolder.path : '';
  
  
  const files = allFiles.filter(file => {
    const filePath = file.path || '';
    const fileDir = filePath.substring(0, filePath.lastIndexOf('/')) || '';
    const match = fileDir === currentPath;
    console.log('🔍 File:', file.name, 'path:', filePath, 'dir:', fileDir, 'currentPath:', currentPath, 'match:', match);
    return match;
  });

  const folders = allFolders.filter(folder => {
    const folderPath = folder.path || '';
    const folderParent = folderPath.substring(0, folderPath.lastIndexOf('/')) || '';
    const match = folderParent === currentPath;
    console.log('🔍 Folder:', folder.name, 'path:', folderPath, 'parent:', folderParent, 'currentPath:', currentPath, 'match:', match);
    return match;
  });

  console.log('📊 Current path:', currentPath || '/', 'Files:', files.length, 'Folders:', folders.length);

  const onRefresh = () => {
    refetchFiles();
    refetchFolders();
  }; 
  return (
    <div className="p-6 animate-fadeIn">
      {}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-100 tracking-tight">
            {currentFolder ? currentFolder.name : 'My Drive'}
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-normal">
            {files.length} {files.length === 1 ? 'file' : 'files'} • {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            {currentFolder && <span className="text-primary-500"> • In folder</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {}
          <div className="flex bg-[#1a1a1a] border border-gray-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {}
          <button
            onClick={() => setShowFolderModal(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>
      {}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-800/30"></div>
          </div>
        </div>
      ) : files.length === 0 && folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-fadeIn">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-600/10 to-primary-700/5 flex items-center justify-center mb-6">
            <Upload className="w-16 h-16 text-primary-500/60" />
          </div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">No files yet</h3>
          <p className="text-gray-500 mb-6 text-sm">Upload your first file to get started</p>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary px-6 py-2.5 text-sm"
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
      {}
      {showUpload && (
        <UploadModal
          currentFolder={currentFolder}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false); 
            onRefresh(); 
          }}
        />
      )}
      {}
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
