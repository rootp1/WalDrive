import { Folder, FileText, Image, Video, Music, File as FileIcon, Download, Trash2, Share2, Eye, Lock, Globe } from 'lucide-react';
import { useState } from 'react';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { deleteFileTransaction, toggleFilePublicTransaction } from '../services/sui';
import { getWalrusUrl } from '../services/walrus';
function FileList({ files, folders, onRefresh, onFolderOpen }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-5 h-5 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-red-500" />;
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
  const handleShare = (file) => {
    setFileToShare(file);
    setShowShareModal(true);
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-850 border-b border-gray-800">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Name</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 hidden md:table-cell">Size</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 hidden lg:table-cell">Modified</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Visibility</th>
            <th className="text-right px-6 py-3 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {}
                              {folders.map((folder) => (
            <tr
              key={folder.id}
              onClick={() => onFolderOpen(folder)}
              className="border-b border-gray-800 hover:bg-gray-850 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="font-medium">{folder.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell">-</td>
              <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">
                {new Date(folder.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {folder.isPublic ? (
                  <Globe className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </td>
              <td className="px-6 py-4 text-right">-</td>
            </tr>
          ))}
          {}
          {files.map((file) => (
            <tr key={file.id} className="border-b border-gray-800 hover:bg-gray-850 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <span className="text-white truncate">{file.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-400 hidden md:table-cell">
                {formatFileSize(file.size)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-400 hidden lg:table-cell">
                {new Date(file.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {file.isPublic ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-500">
                    <Globe className="w-4 h-4" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                    <Lock className="w-4 h-4" />
                    Private
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
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
                    onClick={() => handleShare(file)}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 hover:bg-red-900/20 hover:text-red-500 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
export default FileList;
