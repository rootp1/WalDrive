module waldrive::folder_registry {
    use std::string::String;
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::event;
    public struct Folder has key, store {
        id: UID,
        name: String,
        owner: address,
        parent_id: Option<ID>,
        is_public: bool,
        created_at: u64,
    }
    public struct FolderCreated has copy, drop {
        folder_id: ID,
        owner: address,
        name: String,
        parent_id: Option<ID>,
    }
    public struct FolderUpdated has copy, drop {
        folder_id: ID,
        name: String,
    }
    public struct FolderDeleted has copy, drop {
        folder_id: ID,
        owner: address,
    }
    public struct FolderMoved has copy, drop {
        folder_id: ID,
        old_parent: Option<ID>,
        new_parent: Option<ID>,
    }
    const ENotOwner: u64 = 0;
    const EInvalidName: u64 = 1;
    public entry fun create_folder(
        name: String,
        parent_id: Option<ID>,
        is_public: bool,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let folder_id = object::uid_to_inner(&uid);
        let folder = Folder {
            id: uid,
            name,
            owner: sender,
            parent_id,
            is_public,
            created_at: ctx.epoch(),
        };
        event::emit(FolderCreated {
            folder_id,
            owner: sender,
            name: folder.name,
            parent_id,
        });
        transfer::public_transfer(folder, sender);
    }
    public fun name(folder: &Folder): String {
        folder.name
    }
    public fun owner(folder: &Folder): address {
        folder.owner
    }
    public fun parent_id(folder: &Folder): Option<ID> {
        folder.parent_id
    }
    public fun is_public(folder: &Folder): bool {
        folder.is_public
    }
    public fun created_at(folder: &Folder): u64 {
        folder.created_at
    }
    public entry fun update_name(folder: &mut Folder, new_name: String, ctx: &TxContext) {
        assert!(folder.owner == ctx.sender(), ENotOwner);
        folder.name = new_name;
        event::emit(FolderUpdated {
            folder_id: object::id(folder),
            name: new_name,
        });
    }
    public entry fun toggle_public(folder: &mut Folder, ctx: &TxContext) {
        assert!(folder.owner == ctx.sender(), ENotOwner);
        folder.is_public = !folder.is_public;
    }
    public entry fun move_to_parent(
        folder: &mut Folder, 
        new_parent_id: Option<ID>, 
        ctx: &TxContext
    ) {
        assert!(folder.owner == ctx.sender(), ENotOwner);
        let old_parent = folder.parent_id;
        folder.parent_id = new_parent_id;
        event::emit(FolderMoved {
            folder_id: object::id(folder),
            old_parent,
            new_parent: new_parent_id,
        });
    }
    public entry fun transfer_folder(folder: Folder, new_owner: address, ctx: &TxContext) {
        assert!(folder.owner == ctx.sender(), ENotOwner);
        transfer::public_transfer(folder, new_owner);
    }
    public entry fun delete_folder(folder: Folder, ctx: &TxContext) {
        assert!(folder.owner == ctx.sender(), ENotOwner);
        let Folder { id, owner, .. } = folder;
        event::emit(FolderDeleted {
            folder_id: object::uid_to_inner(&id),
            owner,
        });
        object::delete(id);
    }
}
