import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe } from 'lucide-react';
import { useState } from 'react';
import FilePreviewModal from './FilePreviewModal';
import { filesAPI, foldersAPI } from '../services/api';

function FileGrid({ files, folders, onRefresh, onFolderOpen }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-12 h-12" />;
    if (mimeType.startsWith('image/')) return <Image className="w-12 h-12 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-12 h-12 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-12 h-12 text-red-500" />;
    return <FileIcon className="w-12 h-12 text-gray-400" />;
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await filesAPI.delete(fileId);
      onRefresh();
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await filesAPI.download(file._id);
      // Get Walrus aggregator URL from response
      const walrusUrl = response.data.url;
      const filename = response.data.filename;
      
      console.log('🔗 Downloading from Walrus:', walrusUrl);
      
      // Download directly from Walrus network
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

  const handleTogglePublic = async (file) => {
    try {
      await filesAPI.update(file._id, { isPublic: !file.isPublic });
      onRefresh();
    } catch (error) {
      alert('Failed to update file');
    }
  };

  const copyShareLink = (file) => {
    if (!file.shareLink) return;
    const link = `${window.location.origin}/share/${file.shareLink}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder._id}
            onClick={() => onFolderOpen(folder)}
            className="group bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-primary-600 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <Folder className="w-12 h-12 text-primary-500" />
              {folder.isPublic && <Globe className="w-4 h-4 text-gray-400" />}
            </div>
            <h3 className="font-medium text-white truncate">{folder.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{folder.path}</p>
          </div>
        ))}

        {/* Files */}
        {files.map((file) => (
          <div
            key={file._id}
            className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-primary-600 transition-all"
          >
            {/* Preview */}
            <div
              onClick={() => {
                setSelectedFile(file);
                setShowPreview(true);
              }}
              className="p-6 flex items-center justify-center bg-gray-850 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {getFileIcon(file.mimeType)}
            </div>

            {/* Info */}
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
                {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
              </p>

              {/* Actions */}
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
                  className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTogglePublic(file)}
                  className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                  title={file.isPublic ? 'Make Private' : 'Make Public'}
                >
                  {file.isPublic ? <Globe className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4" />}
                </button>
                {file.isPublic && file.shareLink && (
                  <button
                    onClick={() => copyShareLink(file)}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    title="Copy Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(file._id)}
                  className="p-1.5 hover:bg-red-900/20 hover:text-red-500 rounded transition-colors ml-auto"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
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
    </div>
  );
}

export default FileGrid;
