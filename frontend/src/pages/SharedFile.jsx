import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, FileText, Image, Video, Music, File as FileIcon } from 'lucide-react';
import { useSuiClient } from '@mysten/dapp-kit';
import { getWalrusUrl } from '../services/walrus';
import { PACKAGE_ID, MODULE_NAMES } from '../config/contracts';
function SharedFile() {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const suiClient = useSuiClient();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadSharedFile();
  }, [shareLink]);
  
  const loadSharedFile = async () => {
    if (!shareLink) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Query for public files with matching share token
      const objects = await suiClient.getOwnedObjects({
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::FileMetadata`
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      // Find file with matching share token
      let foundFile = null;
      for (const obj of objects.data) {
        const content = obj.data?.content?.fields;
        if (content && content.is_public) {
          // For now, we'll use the file ID as share link since share_token is optional
          if (obj.data.objectId.includes(shareLink) || shareLink === obj.data.objectId) {
            foundFile = {
              id: obj.data.objectId,
              name: content.name,
              blobId: content.blob_id,
              size: parseInt(content.size),
              mimeType: content.mime_type,
              isPublic: content.is_public,
              createdAt: parseInt(content.created_at),
              owner: content.owner,
            };
            break;
          }
        }
      }

      if (foundFile) {
        setFile(foundFile);
      } else {
        setError('File not found or not publicly shared');
      }
    } catch (error) {
      console.error('Failed to load shared file:', error);
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = () => {
    if (!file || !file.blobId) return;
    const walrusUrl = getWalrusUrl(file.blobId);
    const link = document.createElement('a');
    link.href = walrusUrl;
    link.setAttribute('download', file.name);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-24 h-24 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <Image className="w-24 h-24 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-24 h-24 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-24 h-24 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-24 h-24 text-red-500" />;
    return <FileIcon className="w-24 h-24 text-gray-400" />;
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">File Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  const isImage = file?.mimeType?.startsWith('image/');
  const isVideo = file?.mimeType?.startsWith('video/');
  return (
    <div className="min-h-screen bg-black">
      {}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 text-transparent bg-clip-text">
              WalDrive
            </h1>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </header>
      {}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-start gap-4">
              {getFileIcon(file.mimeType)}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{file.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>Uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          {}
          <div className="p-6 bg-black">
            {isImage ? (
              <div className="flex items-center justify-center">
                <img
                  src={getWalrusUrl(file.blobId)}
                  alt={file.name}
                  className="max-w-full max-h-[600px] object-contain rounded-lg"
                />
              </div>
            ) : isVideo ? (
              <div className="flex items-center justify-center">
                <video
                  src={getWalrusUrl(file.blobId)}
                  controls
                  className="max-w-full max-h-[600px] rounded-lg"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileIcon className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400 mb-6">Preview not available for this file type</p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Powered by Walrus Decentralized Storage</p>
        </div>
      </div>
    </div>
  );
}
export default SharedFile;
