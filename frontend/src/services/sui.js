import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_NAMES } from '../config/contracts';

export const createFileTransaction = (name, blobId, size, mimeType, folderId, isPublic) => {
  const tx = new Transaction();
  
  // For Option<ID>, we need to use proper option encoding
  let folderIdArg;
  if (folderId) {
    folderIdArg = tx.pure.option('address', folderId);
  } else {
    folderIdArg = tx.pure.option('address', null);
  }
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FILE_METADATA}::create_file`,
    arguments: [
      tx.pure.string(name),
      tx.pure.string(blobId),
      tx.pure.u64(size),
      tx.pure.string(mimeType),
      folderIdArg,
      tx.pure.bool(isPublic),
    ],
  });
  
  return tx;
};

export const createFolderTransaction = (name, parentId, isPublic) => {
  const tx = new Transaction();
  
  // For Option<ID>, we need to use proper option encoding
  let parentIdArg;
  if (parentId) {
    parentIdArg = tx.pure.option('address', parentId);
  } else {
    parentIdArg = tx.pure.option('address', null);
  }
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAMES.FOLDER_REGISTRY}::create_folder`,
    arguments: [
      tx.pure.string(name),
      parentIdArg,
      tx.pure.bool(isPublic),
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
