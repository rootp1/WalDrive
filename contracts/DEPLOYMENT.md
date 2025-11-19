# Waldrive Smart Contract Deployment

## FileMetadata Contract
- **Package ID**: (to be deployed)
- **Network**: Sui Testnet
- **Module**: waldrive::file_metadata

## Deployment Instructions

### 1. Deploy FileMetadata Contract
```bash
cd contracts
sui client publish --gas-budget 100000000
```

### 2. Save Package ID
After deployment, save the Package ID here and in `frontend/src/config/contracts.js`

## Contract Functions

### FileMetadata
- `create_file(name, blob_id, size, mime_type, folder_id, is_public)`
- `update_name(file, new_name)`
- `toggle_public(file)`
- `move_to_folder(file, folder_id)`
- `set_share_token(file, token)`
- `transfer_file(file, to)`
- `delete_file(file)`
