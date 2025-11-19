module waldrive::file_metadata {
    use std::string::String;
    use std::option::{Self, Option};
    use sui::event;

    // ===== Structs =====

    /// Represents a file stored on Walrus
    public struct FileMetadata has key, store {
        id: UID,
        /// Original file name
        name: String,
        /// Walrus blob ID for retrieving the file
        blob_id: String,
        /// Owner's wallet address
        owner: address,
        /// File size in bytes
        size: u64,
        /// MIME type (e.g., "image/png", "application/pdf")
        mime_type: String,
        /// Optional folder ID this file belongs to
        folder_id: Option<ID>,
        /// Whether the file is publicly accessible
        is_public: bool,
        /// Timestamp when file was created
        created_at: u64,
        /// Optional share token for public access
        share_token: Option<String>,
    }

    // ===== Events =====

    public struct FileCreated has copy, drop {
        file_id: ID,
        owner: address,
        blob_id: String,
        name: String,
    }

    public struct FileUpdated has copy, drop {
        file_id: ID,
        name: String,
    }

    public struct FileDeleted has copy, drop {
        file_id: ID,
        owner: address,
    }

    public struct FileTransferred has copy, drop {
        file_id: ID,
        from: address,
        to: address,
    }

    // ===== Error Codes =====

    const ENotOwner: u64 = 0;
    const EInvalidBlobId: u64 = 1;
    const EInvalidSize: u64 = 2;

    // ===== Public Functions =====

    /// Create a new file metadata entry
    public fun create_file(
        name: String,
        blob_id: String,
        size: u64,
        mime_type: String,
        folder_id: Option<ID>,
        is_public: bool,
        ctx: &mut TxContext
    ): FileMetadata {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let file_id = object::uid_to_inner(&uid);

        let file = FileMetadata {
            id: uid,
            name,
            blob_id,
            owner: sender,
            size,
            mime_type,
            folder_id,
            is_public,
            created_at: ctx.epoch_timestamp_ms(),
            share_token: option::none(),
        };

        event::emit(FileCreated {
            file_id,
            owner: sender,
            blob_id: file.blob_id,
            name: file.name,
        });

        file
    }

    // ===== Accessors =====

    public fun name(file: &FileMetadata): String {
        file.name
    }

    public fun blob_id(file: &FileMetadata): String {
        file.blob_id
    }

    public fun owner(file: &FileMetadata): address {
        file.owner
    }

    public fun size(file: &FileMetadata): u64 {
        file.size
    }

    public fun mime_type(file: &FileMetadata): String {
        file.mime_type
    }

    public fun is_public(file: &FileMetadata): bool {
        file.is_public
    }

    public fun folder_id(file: &FileMetadata): Option<ID> {
        file.folder_id
    }

    public fun created_at(file: &FileMetadata): u64 {
        file.created_at
    }

    public fun share_token(file: &FileMetadata): Option<String> {
        file.share_token
    }
}
