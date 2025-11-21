import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_NAMES } from '../config/contracts';

export const createFileTransaction = (name, encryptedBlobId, encryptedFileKey, size, mimeType, path, isPublic) => {
  const tx = new Transaction();
  
  console.log('Creating file transaction with:', {
    name,
    encryptedBlobId: encryptedBlobId?.substring(0, 20) + '...',
    encryptedFileKey: encryptedFileKey?.substring(0, 20) + '...',
    size,
    mimeType,
    path,
    isPublic
  });
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::create_file`,
    arguments: [
      tx.pure.string(String(name)),
      tx.pure.string(String(encryptedBlobId)),
      tx.pure.string(String(encryptedFileKey)),
      tx.pure.u64(Number(size)),
      tx.pure.string(String(mimeType)),
      tx.pure.string(String(path)),
      tx.pure.bool(Boolean(isPublic)),
      tx.object('0x6'), 
    ],
  });
  
  return tx;
};

export const createFolderTransaction = (name, path, isPublic) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FOLDER_REGISTRY}::create_folder`,
    arguments: [
      tx.pure.string(name),
      tx.pure.string(path),
      tx.pure.bool(isPublic),
      tx.object('0x6'), 
    ],
  });
  
  return tx;
};

export const deleteFileTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::delete_file`,
    arguments: [tx.object(fileId)],
  });
  
  return tx;
};

export const updateFileNameTransaction = (fileId, newName) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::update_name`,
    arguments: [
      tx.object(fileId),
      tx.pure.string(newName),
    ],
  });
  
  return tx;
};

export const toggleFilePublicTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::toggle_public`,
    arguments: [tx.object(fileId)],
  });
  
  return tx;
};

export const createUserProfileTransaction = () => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.USER_PROFILE}::create_profile`,
    arguments: [],
  });
  
  return tx;
};

export const createShareCapabilityTransaction = (fileId, sharedWith, canWrite, canDelete) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.SHARING}::create_capability`,
    arguments: [
      tx.pure.id(fileId),
      tx.pure.address(sharedWith),
      tx.pure.bool(canWrite),
      tx.pure.bool(canDelete),
    ],
  });
  
  return tx;
};

export const toggleStarTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::toggle_star`,
    arguments: [tx.object(fileId)],
  });
  
  return tx;
};

export const moveToTrashTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::move_to_trash`,
    arguments: [
      tx.object(fileId),
      tx.object('0x6'), 
    ],
  });
  
  return tx;
};

export const restoreFromTrashTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::restore_from_trash`,
    arguments: [tx.object(fileId)],
  });
  
  return tx;
};

export const permanentlyDeleteFileTransaction = (fileId) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::delete_file`,
    arguments: [tx.object(fileId)],
  });
  
  return tx;
};
