module waldrive::user_profile {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::event;
    use sui::vec_set::{Self, VecSet};
    public struct UserProfile has key {
        id: UID,
        wallet_address: address,
        storage_used: u64,
        file_ids: VecSet<ID>,
        folder_ids: VecSet<ID>,
        created_at: u64,
    }
    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        wallet_address: address,
    }
    public struct StorageUpdated has copy, drop {
        profile_id: ID,
        old_storage: u64,
        new_storage: u64,
    }
    public struct FileAdded has copy, drop {
        profile_id: ID,
        file_id: ID,
    }
    public struct FileRemoved has copy, drop {
        profile_id: ID,
        file_id: ID,
    }
    public struct FolderAdded has copy, drop {
        profile_id: ID,
        folder_id: ID,
    }
    public struct FolderRemoved has copy, drop {
        profile_id: ID,
        folder_id: ID,
    }
    const ENotOwner: u64 = 0;
    const EFileAlreadyExists: u64 = 1;
    const EFolderAlreadyExists: u64 = 2;
    public entry fun create_profile(ctx: &mut TxContext) {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let profile_id = object::uid_to_inner(&uid);
        let profile = UserProfile {
            id: uid,
            wallet_address: sender,
            storage_used: 0,
            file_ids: vec_set::empty(),
            folder_ids: vec_set::empty(),
            created_at: ctx.epoch_timestamp_ms(),
        };
        event::emit(ProfileCreated {
            profile_id,
            wallet_address: sender,
        });
        transfer::transfer(profile, sender);
    }
    public fun wallet_address(profile: &UserProfile): address {
        profile.wallet_address
    }
    public fun storage_used(profile: &UserProfile): u64 {
        profile.storage_used
    }
    public fun file_count(profile: &UserProfile): u64 {
        vec_set::size(&profile.file_ids)
    }
    public fun folder_count(profile: &UserProfile): u64 {
        vec_set::size(&profile.folder_ids)
    }
    public fun has_file(profile: &UserProfile, file_id: ID): bool {
        vec_set::contains(&profile.file_ids, &file_id)
    }
    public fun has_folder(profile: &UserProfile, folder_id: ID): bool {
        vec_set::contains(&profile.folder_ids, &folder_id)
    }
    public entry fun add_file(profile: &mut UserProfile, file_id: ID, file_size: u64, ctx: &TxContext) {
        assert!(profile.wallet_address == ctx.sender(), ENotOwner);
        assert!(!vec_set::contains(&profile.file_ids, &file_id), EFileAlreadyExists);
        vec_set::insert(&mut profile.file_ids, file_id);
        profile.storage_used = profile.storage_used + file_size;
        event::emit(FileAdded {
            profile_id: object::id(profile),
            file_id,
        });
    }
    public entry fun remove_file(profile: &mut UserProfile, file_id: ID, file_size: u64, ctx: &TxContext) {
        assert!(profile.wallet_address == ctx.sender(), ENotOwner);
        vec_set::remove(&mut profile.file_ids, &file_id);
        profile.storage_used = profile.storage_used - file_size;
        event::emit(FileRemoved {
            profile_id: object::id(profile),
            file_id,
        });
    }
    public entry fun add_folder(profile: &mut UserProfile, folder_id: ID, ctx: &TxContext) {
        assert!(profile.wallet_address == ctx.sender(), ENotOwner);
        assert!(!vec_set::contains(&profile.folder_ids, &folder_id), EFolderAlreadyExists);
        vec_set::insert(&mut profile.folder_ids, folder_id);
        event::emit(FolderAdded {
            profile_id: object::id(profile),
            folder_id,
        });
    }
    public entry fun remove_folder(profile: &mut UserProfile, folder_id: ID, ctx: &TxContext) {
        assert!(profile.wallet_address == ctx.sender(), ENotOwner);
        vec_set::remove(&mut profile.folder_ids, &folder_id);
        event::emit(FolderRemoved {
            profile_id: object::id(profile),
            folder_id,
        });
    }
    public entry fun update_storage(profile: &mut UserProfile, new_storage: u64, ctx: &TxContext) {
        assert!(profile.wallet_address == ctx.sender(), ENotOwner);
        let old_storage = profile.storage_used;
        profile.storage_used = new_storage;
        event::emit(StorageUpdated {
            profile_id: object::id(profile),
            old_storage,
            new_storage,
        });
    }
}
