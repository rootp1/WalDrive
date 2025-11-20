import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { PACKAGE_ID, MODULE_NAMES } from '../config/contracts';

export const useUserFiles = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    if (!currentAccount) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::FileMetadata`
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      const fileData = objects.data.map(obj => {
        const content = obj.data.content.fields;
        
        const fileObj = {
          id: obj.data.objectId,
          name: content.name,
          blobId: content.blob_id,
          size: parseInt(content.size),
          mimeType: content.mime_type,
          isPublic: content.is_public,
          createdAt: parseInt(content.created_at),
          path: content.path,
          shareToken: content.share_token,
          owner: content.owner,
        };
        
        console.log('📄 File:', fileObj.name, 'path:', fileObj.path);
        return fileObj;
      });

      setFiles(fileData);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentAccount]);

  return { files, loading, refetch: fetchFiles };
};

export const useUserFolders = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    if (!currentAccount) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAMES.FOLDER_REGISTRY}::Folder`
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      const folderData = objects.data.map(obj => {
        const content = obj.data.content.fields;
        
        const folderObj = {
          id: obj.data.objectId,
          name: content.name,
          path: content.path,
          isPublic: content.is_public,
          createdAt: parseInt(content.created_at),
          owner: content.owner,
        };
        
        console.log('📁 Folder:', folderObj.name, 'path:', folderObj.path);
        return folderObj;
      });

      setFolders(folderData);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [currentAccount]);

  return { folders, loading, refetch: fetchFolders };
};
