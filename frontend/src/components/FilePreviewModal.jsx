import { X, Download, Share2, Lock, Globe, ExternalLink, FileText, Image, Video, Music, File as FileIcon, FileCode, FileArchive, FileSpreadsheet, Presentation } from 'lucide-react';
import { useState } from 'react';
import { getWalrusUrl } from '../services/walrus';
import { toggleFilePublicTransaction } from '../services/sui';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function FilePreviewModal({ file, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-16 h-16 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <Image className="w-16 h-16 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-16 h-16 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-16 h-16 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-16 h-16 text-blue-600" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-16 h-16 text-green-600" />;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="w-16 h-16 text-orange-500" />;
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('python') || 
        mimeType.includes('java') || mimeType.includes('json') || mimeType.includes('xml') || 
        mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('text/')) return <FileCode className="w-16 h-16 text-yellow-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || 
        mimeType.includes('7z') || mimeType.includes('compressed')) return <FileArchive className="w-16 h-16 text-amber-600" />;
    return <FileIcon className="w-16 h-16 text-gray-400" />;
  };
  
  const previewUrl = file.blobId ? getWalrusUrl(file.blobId) : null;
  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isPDF = file.mimeType?.includes('pdf');
  const handleDownload = () => {
    if (!file.blobId) {
      alert('No blob ID available for download');
      return;
    }
    
    const walrusUrl = getWalrusUrl(file.blobId);
    console.log('🔗 Downloading from Walrus:', walrusUrl);
    
    const link = document.createElement('a');
    link.href = walrusUrl;
    link.setAttribute('download', file.name);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleTogglePublic = () => {
    setLoading(true);
    const transaction = toggleFilePublicTransaction(file.id);
    
    signAndExecute(
      { transaction },
      {
        onSuccess: () => {
          console.log('✅ File visibility toggled successfully');
          setTimeout(() => {
            onRefresh();
            onClose();
          }, 1000);
        },
        onError: (error) => {
          console.error('❌ Failed to toggle file visibility:', error);
          alert('Failed to update file visibility');
          setLoading(false);
        },
      }
    );
  };
  const copyShareLink = () => {
    if (!file.id) return;
    const link = `${window.location.origin}/share/${file.id}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] border border-gray-800 flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{file.name}</h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={file.isPublic ? 'Make Private' : 'Make Public'}
            >
              {file.isPublic ? (
                <Globe className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </button>
            {file.isPublic && (
              <button
                onClick={copyShareLink}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy Share Link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {}
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          {!previewUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : isVideo ? (
            <div className="flex items-center justify-center h-full">
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-full rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : isAudio ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-center mb-4">
                <p className="text-gray-400">Audio file</p>
              </div>
              <audio src={previewUrl} controls className="w-full max-w-md">
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : isPDF ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[600px] rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {getFileIcon(file.mimeType)}
              <p className="text-gray-400 mb-4 mt-6">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>
        {}
        {file.description && (
          <div className="p-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              <span className="font-medium">Description:</span> {file.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default FilePreviewModal;
