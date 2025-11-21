module waldrive::file_metadata {
    use std::string::String;
    use std::option::{Self, Option};
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    public struct FileMetadata has key, store {
        id: UID,
        name: String,
        encrypted_blob_id: String,      
        encrypted_file_key: String,     
        owner: address,
        size: u64,
        mime_type: String,
        path: String,
        is_public: bool,
        is_starred: bool,
        is_trashed: bool,
        created_at: u64,
        trashed_at: Option<u64>,
        share_token: Option<String>,
    }
    public struct FileCreated has copy, drop {
        file_id: ID,
        owner: address,
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

    public struct FileStarred has copy, drop {
        file_id: ID,
        is_starred: bool,
    }

    public struct FileTrashed has copy, drop {
        file_id: ID,
        is_trashed: bool,
    }

    public struct FileRestored has copy, drop {
        file_id: ID,
        owner: address,
    }
    public struct FileTransferred has copy, drop {
        file_id: ID,
        from: address,
        to: address,
    }
    const ENotOwner: u64 = 0;
    const EInvalidBlobId: u64 = 1;
    const EInvalidSize: u64 = 2;
    public entry fun create_file(
        name: String,
        encrypted_blob_id: String,
        encrypted_file_key: String,
        size: u64,
        mime_type: String,
        path: String,
        is_public: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let file_id = object::uid_to_inner(&uid);
        let file = FileMetadata {
            id: uid,
            name,
            encrypted_blob_id,
            encrypted_file_key,
            owner: sender,
            size,
            mime_type,
            path,
            is_public,
            is_starred: false,
            is_trashed: false,
            created_at: clock::timestamp_ms(clock),
            trashed_at: option::none(),
            share_token: option::none(),
        };
        event::emit(FileCreated {
            file_id,
            owner: sender,
            name: file.name,
        });
        transfer::public_transfer(file, sender);
    }
    public fun name(file: &FileMetadata): String {
        file.name
    }
    public fun encrypted_blob_id(file: &FileMetadata): String {
        file.encrypted_blob_id
    }
    
    public fun encrypted_file_key(file: &FileMetadata): String {
        file.encrypted_file_key
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
    public fun path(file: &FileMetadata): String {
        file.path
    }
    public fun created_at(file: &FileMetadata): u64 {
        file.created_at
    }

    public fun is_starred(file: &FileMetadata): bool {
        file.is_starred
    }

    public fun is_trashed(file: &FileMetadata): bool {
        file.is_trashed
    }

    public fun trashed_at(file: &FileMetadata): Option<u64> {
        file.trashed_at
    }
    public fun share_token(file: &FileMetadata): Option<String> {
        file.share_token
    }
    public entry fun update_name(file: &mut FileMetadata, new_name: String, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.name = new_name;
        event::emit(FileUpdated {
            file_id: object::id(file),
            name: new_name,
        });
    }
    public entry fun toggle_public(file: &mut FileMetadata, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.is_public = !file.is_public;
    }
    public entry fun move_file(file: &mut FileMetadata, new_path: String, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.path = new_path;
    }
    public entry fun set_share_token(file: &mut FileMetadata, token: String, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.share_token = option::some(token);
    }

    public entry fun toggle_star(file: &mut FileMetadata, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.is_starred = !file.is_starred;
        event::emit(FileStarred {
            file_id: object::id(file),
            is_starred: file.is_starred,
        });
    }

    public entry fun move_to_trash(file: &mut FileMetadata, clock: &Clock, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.is_trashed = true;
        file.trashed_at = option::some(clock::timestamp_ms(clock));
        event::emit(FileTrashed {
            file_id: object::id(file),
            is_trashed: true,
        });
    }

    public entry fun restore_from_trash(file: &mut FileMetadata, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        file.is_trashed = false;
        file.trashed_at = option::none();
        event::emit(FileRestored {
            file_id: object::id(file),
            owner: file.owner,
        });
    }
    public entry fun transfer_file(file: FileMetadata, to: address, ctx: &TxContext) {
        let from = file.owner;
        event::emit(FileTransferred {
            file_id: object::id(&file),
            from,
            to,
        });
        transfer::public_transfer(file, to);
    }
    public entry fun delete_file(file: FileMetadata, ctx: &TxContext) {
        assert!(file.owner == ctx.sender(), ENotOwner);
        let FileMetadata { 
            id,
            name: _,
            encrypted_blob_id: _,
            encrypted_file_key: _,
            owner,
            size: _,
            mime_type: _,
            path: _,
            is_public: _,
            is_starred: _,
            is_trashed: _,
            created_at: _,
            trashed_at: _,
            share_token: _,
        } = file;
        event::emit(FileDeleted {
            file_id: object::uid_to_inner(&id),
            owner,
        });
        object::delete(id);
    }
}
