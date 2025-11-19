import { X, Download, Share2, Lock, Globe, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';
function FilePreviewModal({ file, onClose, onRefresh }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isPDF = file.mimeType?.includes('pdf');
  useEffect(() => {
    const loadPreviewUrl = async () => {
      try {
        const url = await filesAPI.getPreviewUrl(file._id);
        setPreviewUrl(url);
      } catch (error) {
        console.error('Failed to load preview URL:', error);
      }
    };
    loadPreviewUrl();
  }, [file._id]);
  const handleDownload = async () => {
    try {
      const response = await filesAPI.download(file._id);
      const walrusUrl = response.data.url;
      const filename = response.data.filename;
      console.log('🔗 Downloading from Walrus:', walrusUrl);
      const link = document.createElement('a');
      link.href = walrusUrl;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download file');
    }
  };
  const handleTogglePublic = async () => {
    try {
      await filesAPI.update(file._id, { isPublic: !file.isPublic });
      onRefresh();
      onClose();
    } catch (error) {
      alert('Failed to update file');
    }
  };
  const copyShareLink = () => {
    if (!file.shareLink) return;
    const link = `${window.location.origin}/share/${file.shareLink}`;
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
              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
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
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={file.isPublic ? 'Make Private' : 'Make Public'}
            >
              {file.isPublic ? (
                <Globe className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </button>
            {file.isPublic && file.shareLink && (
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
              <p className="text-gray-400 mb-4">Preview not available for this file type</p>
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
