import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe, FileCode, FileArchive, FileSpreadsheet, Presentation, Star, Info, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';
import ContextMenu from './ContextMenu';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { deleteFileTransaction, toggleFilePublicTransaction, toggleStarTransaction, moveToTrashTransaction, restoreFromTrashTransaction, permanentlyDeleteFileTransaction } from '../services/sui';
import { getWalrusUrl } from '../services/walrus';
function FileList({ files, folders, onRefresh, onFolderOpen }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-5 h-5 text-gray-400" />;
    
    
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    
    
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    
    
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    
    
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    
    
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    
    
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-5 h-5 text-orange-500" />;
    
    
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || 
        mimeType.includes('python') || mimeType.includes('java') ||
        mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') ||
        mimeType.includes('css') || mimeType.includes('text/')) return <FileCode className="w-5 h-5 text-yellow-500" />;
    
    
    if (mimeType.includes('zip') || mimeType.includes('rar') || 
        mimeType.includes('tar') || mimeType.includes('7z') ||
        mimeType.includes('compressed')) return <FileArchive className="w-5 h-5 text-amber-600" />;
    
    return <FileIcon className="w-5 h-5 text-gray-400" />;
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
    alert(`File Information:\n\nName: ${file.name}\nSize: ${formatFileSize(file.size)}\nType: ${file.mimeType}\nCreated: ${new Date(file.createdAt).toLocaleString()}\nBlob ID: ${file.blobId}\nPublic: ${file.isPublic ? 'Yes' : 'No'}`);
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <div className="drive-card overflow-hidden animate-slideUp">
      <table className="w-full">
        <thead className="bg-[#141414] border-b border-gray-800/50">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Size</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Modified</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {}
          {folders.map((folder) => (
            <tr
              key={folder.id}
              onClick={() => onFolderOpen(folder)}
              className="border-b border-gray-800/50 hover:bg-[#202020] cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-primary-500 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                  <span className="font-normal text-sm text-gray-200">{folder.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">-</td>
              <td className="px-6 py-4 text-gray-500 text-sm hidden lg:table-cell">
                {new Date(folder.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {folder.isPublic ? (
                  <Globe className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-gray-600 text-sm">-</span>
              </td>
            </tr>
          ))}
          {files.map((file) => (
            <tr 
              key={file.id} 
              className="border-b border-gray-800/50 hover:bg-[#202020] transition-colors group"
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-gray-200 truncate text-sm font-normal ${file.isStarred ? 'font-medium' : ''}`}>
                      {file.name}
                    </span>
                    {file.isStarred && (
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                    )}
                    {file.isTrashed && (
                      <span className="text-xs text-red-400 ml-2">(Trashed)</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                {formatFileSize(file.size)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                {new Date(file.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {file.isPublic ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Public</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Private</span>
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(file.id);
                    }}
                    className={`icon-btn p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${file.isStarred ? 'opacity-100' : ''}`}
                    title={file.isStarred ? "Unstar" : "Star"}
                  >
                    <Star className={`w-4 h-4 ${file.isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={(e) => handleContextMenu(e, file)}
                    className="icon-btn p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
export default FileList;
