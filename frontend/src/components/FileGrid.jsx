import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe, FileCode, FileArchive, FileSpreadsheet, Presentation, Star, Info } from 'lucide-react';
import { useState } from 'react';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { deleteFileTransaction, toggleFilePublicTransaction } from '../services/sui';
import { getWalrusUrl } from '../services/walrus';

function FileGrid({ files, folders, onRefresh, onFolderOpen }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [starredFiles, setStarredFiles] = useState(new Set());
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
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      const tx = deleteFileTransaction(fileId);
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => onRefresh(),
          onError: (error) => alert('Failed to delete file: ' + error.message)
        }
      );
    } catch (error) {
      alert('Failed to delete file');
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
    setStarredFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
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
        {}
        {files.map((file) => (
          <div
            key={file.id}
            className="group drive-card overflow-hidden flex flex-col"
          >
            {}
            <div
              onClick={() => {
                setSelectedFile(file);
                setShowPreview(true);
              }}
              className="p-8 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#141414] border-b border-gray-800/50 cursor-pointer group-hover:from-[#202020] group-hover:to-[#181818] transition-all duration-200 h-32"
            >
              {getFileIcon(file.mimeType)}
            </div>
            {}
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <h3 className="font-normal text-gray-100 truncate text-sm leading-tight">{file.name}</h3>
                  {starredFiles.has(file.id) && (
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                  )}
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
              <div className="flex items-center gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(file.id);
                  }}
                  className={`icon-btn p-1.5 ${starredFiles.has(file.id) ? 'text-yellow-500' : ''}`}
                  title={starredFiles.has(file.id) ? "Unstar" : "Star"}
                >
                  <Star className={`w-3.5 h-3.5 ${starredFiles.has(file.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(file);
                    setShowPreview(true);
                  }}
                  className="icon-btn p-1.5"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  className="icon-btn p-1.5"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(file);
                  }}
                  className="icon-btn p-1.5"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowInfo(file);
                  }}
                  className="icon-btn p-1.5"
                  title="File Info"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  className="icon-btn p-1.5"
                  title="Move to Trash"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
    </div>
  );
}
export default FileGrid;
