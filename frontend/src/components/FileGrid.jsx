import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe, FileCode, FileArchive, FileSpreadsheet, Presentation } from 'lucide-react';
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
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-12 h-12 text-gray-400" />;
    
    // Images
    if (mimeType.startsWith('image/')) return <Image className="w-12 h-12 text-blue-500" />;
    
    // Videos
    if (mimeType.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    
    // Audio
    if (mimeType.startsWith('audio/')) return <Music className="w-12 h-12 text-green-500" />;
    
    // Documents
    if (mimeType.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-12 h-12 text-blue-600" />;
    
    // Spreadsheets
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-12 h-12 text-green-600" />;
    
    // Presentations
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-12 h-12 text-orange-500" />;
    
    // Code files
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || 
        mimeType.includes('python') || mimeType.includes('java') ||
        mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') ||
        mimeType.includes('css') || mimeType.includes('text/')) return <FileCode className="w-12 h-12 text-yellow-500" />;
    
    // Archives
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
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {}
                  {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => onFolderOpen(folder)}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-primary-500 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <Folder className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="font-medium text-white truncate mb-1">{folder.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Folder</span>
              </div>
            </div>
          ))}
        {}
        {files.map((file) => (
          <div
            key={file.id}
            className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-primary-600 transition-all"
          >
            {}
            <div
              onClick={() => {
                setSelectedFile(file);
                setShowPreview(true);
              }}
              className="p-6 flex items-center justify-center bg-gray-850 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {getFileIcon(file.mimeType)}
            </div>
            {}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-white truncate flex-1">{file.name}</h3>
                {file.isPublic ? (
                  <Globe className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
              </p>
              {}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedFile(file);
                    setShowPreview(true);
                  }}
                  className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                              <button
                onClick={() => handleDownload(file)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare(file)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
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
