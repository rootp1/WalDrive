import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe, FileCode, FileArchive, FileSpreadsheet, Presentation, Star, Info, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';
import ContextMenu from './ContextMenu';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { deleteFileTransaction, toggleFilePublicTransaction, toggleStarTransaction, moveToTrashTransaction, restoreFromTrashTransaction, permanentlyDeleteFileTransaction } from '../services/sui';
import { getWalrusUrl } from '../services/walrus';

function FileGrid({ files, folders, onRefresh, onFolderOpen }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-12 h-12 text-gray-400" />;
    
    
    if (mimeType.startsWith('image/')) return <Image className="w-12 h-12 text-blue-500" />;
    
    
    if (mimeType.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    
    
    if (mimeType.startsWith('audio/')) return <Music className="w-12 h-12 text-green-500" />;
    
    
    if (mimeType.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-12 h-12 text-blue-600" />;
    
    
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-12 h-12 text-green-600" />;
    
    
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-12 h-12 text-orange-500" />;
    
    
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || 
        mimeType.includes('python') || mimeType.includes('java') ||
        mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') ||
        mimeType.includes('css') || mimeType.includes('text/')) return <FileCode className="w-12 h-12 text-yellow-500" />;
    
    
    if (mimeType.includes('zip') || mimeType.includes('rar') || 
        mimeType.includes('tar') || mimeType.includes('7z') ||
        mimeType.includes('compressed')) return <FileArchive className="w-12 h-12 text-amber-600" />;
    
    return <FileIcon className="w-12 h-12 text-gray-400" />;
  };
  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to move this file to trash?')) return;
    try {
      const tx = moveToTrashTransaction(fileId);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => onRefresh(),
          onError: (error) => alert('Failed to move file to trash: ' + error.message)
        }
      );
    } catch (error) {
      alert('Failed to move file to trash');
    }
  };
  const handleDownload = async (file) => {
    try {
      const walrusUrl = getWalrusUrl(file.blobId);
      const link = document.createElement('a');
      link.href = walrusUrl;
      link.setAttribute('download', file.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download file');
    }
  };
  const handleShare = (file) => {
    setFileToShare(file);
    setShowShareModal(true);
  };

  const handleToggleStar = (fileId) => {
    try {
      const tx = toggleStarTransaction(fileId);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => onRefresh(),
          onError: (error) => alert('Failed to toggle star: ' + error.message)
        }
      );
    } catch (error) {
      alert('Failed to toggle star');
    }
  };

  const handleRestore = (fileId) => {
    try {
      const tx = restoreFromTrashTransaction(fileId);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => onRefresh(),
          onError: (error) => alert('Failed to restore file: ' + error.message)
        }
      );
    } catch (error) {
      alert('Failed to restore file');
    }
  };

  const handlePermanentDelete = (fileId) => {
    if (!confirm('Are you sure you want to permanently delete this file? This cannot be undone.')) return;
    try {
      const tx = permanentlyDeleteFileTransaction(fileId);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => onRefresh(),
          onError: (error) => alert('Failed to delete file permanently: ' + error.message)
        }
      );
    } catch (error) {
      alert('Failed to delete file permanently');
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file: file
    });
  };

  const handleContextAction = (action, file) => {
    switch (action) {
      case 'preview':
        setSelectedFile(file);
        setShowPreview(true);
        break;
      case 'download':
        handleDownload(file);
        break;
      case 'star':
        handleToggleStar(file.id);
        break;
      case 'share':
        handleShare(file);
        break;
      case 'info':
        handleShowInfo(file);
        break;
      case 'trash':
        handleDelete(file.id);
        break;
      case 'restore':
        handleRestore(file.id);
        break;
      case 'permanentDelete':
        handlePermanentDelete(file.id);
        break;
      case 'rename':
        alert('Rename functionality coming soon!');
        break;
      case 'organize':
        alert('Organize functionality coming soon!');
        break;
      default:
        break;
    }
  };

  const handleShowInfo = (file) => {
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    alert(`File Information:\n\nName: ${file.name}\nSize: ${fileSize}\nType: ${file.mimeType}\nCreated: ${new Date(file.createdAt).toLocaleString()}\nBlob ID: ${file.blobId}\nPublic: ${file.isPublic ? 'Yes' : 'No'}`);
  };
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 animate-slideUp">
        {}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderOpen(folder)}
            className="drive-card p-4 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <Folder className="w-10 h-10 text-primary-500 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="font-medium text-gray-100 truncate mb-1 text-sm">{folder.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Folder</span>
            </div>
          </div>
        ))}
        {files.map((file) => (
          <div
            key={file.id}
            className="group drive-card overflow-hidden flex flex-col"
            onContextMenu={(e) => handleContextMenu(e, file)}
          >
            {}
            <div
              onClick={() => {
                setSelectedFile(file);
                setShowPreview(true);
              }}
              className="p-8 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-b border-gray-800/50 cursor-pointer group-hover:from-[#202020] group-hover:to-[#181818] transition-all duration-200 h-32 relative"
            >
              {getFileIcon(file.mimeType)}
              {file.isStarred && (
                <Star className="absolute top-2 right-2 w-4 h-4 fill-yellow-500 text-yellow-500" />
              )}
              {file.isTrashed && (
                <div className="absolute top-2 left-2 bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">
                  Trashed
                </div>
              )}
            </div>
            {}
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <h3 className={`font-normal text-gray-100 truncate text-sm leading-tight ${file.isStarred ? 'font-medium' : ''}`}>
                    {file.name}
                  </h3>
                </div>
                {file.isPublic ? (
                  <Globe className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-2 mt-0.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 ml-2 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-1 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(file.id);
                  }}
                  className={`icon-btn p-1.5 ${file.isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                  title={file.isStarred ? "Unstar" : "Star"}
                >
                  <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={(e) => handleContextMenu(e, file)}
                  className="icon-btn p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="More options"
                >
                  <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      {showPreview && selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => {
            setShowPreview(false);
            setSelectedFile(null);
          }}
          onRefresh={onRefresh}
        />
      )}
      {}
      {showShareModal && fileToShare && (
        <ShareModal
          file={fileToShare}
          onClose={() => {
            setShowShareModal(false);
            setFileToShare(null);
          }}
          onSuccess={() => {
            setShowShareModal(false);
            setFileToShare(null);
            onRefresh();
          }}
        />
      )}

      {}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          isStarred={contextMenu.file.isStarred}
          isTrashed={contextMenu.file.isTrashed}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  );
}
export default FileGrid;
