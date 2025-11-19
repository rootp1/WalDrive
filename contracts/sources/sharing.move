module waldrive::sharing {
    use std::string::String;
    use std::option::{Self, Option};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::event;
    public struct ShareCapability has key, store {
        id: UID,
        file_id: ID,
        shared_by: address,
        shared_with: address,
        can_write: bool,
        can_delete: bool,
        created_at: u64,
    }
    public struct PublicShareLink has key, store {
        id: UID,
        file_id: ID,
        owner: address,
        share_token: String,
        can_download: bool,
        expires_at: Option<u64>,
        created_at: u64,
    }
    public struct CapabilityCreated has copy, drop {
        capability_id: ID,
        file_id: ID,
        shared_by: address,
        shared_with: address,
    }
    public struct CapabilityRevoked has copy, drop {
        capability_id: ID,
        file_id: ID,
    }
    public struct PublicLinkCreated has copy, drop {
        link_id: ID,
        file_id: ID,
        share_token: String,
    }
    public struct PublicLinkRevoked has copy, drop {
        link_id: ID,
        file_id: ID,
    }
    const ENotOwner: u64 = 0;
    const EExpiredLink: u64 = 1;
    public entry fun create_capability(
        file_id: ID,
        shared_with: address,
        can_write: bool,
        can_delete: bool,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let capability_id = object::uid_to_inner(&uid);
        let capability = ShareCapability {
            id: uid,
            file_id,
            shared_by: sender,
            shared_with,
            can_write,
            can_delete,
            created_at: ctx.epoch_timestamp_ms(),
        };
        event::emit(CapabilityCreated {
            capability_id,
            file_id,
            shared_by: sender,
            shared_with,
        });
        transfer::public_transfer(capability, shared_with);
    }
    public entry fun create_public_link(
        file_id: ID,
        share_token: String,
        can_download: bool,
        expires_at: Option<u64>,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let uid = object::new(ctx);
        let link_id = object::uid_to_inner(&uid);
        let link = PublicShareLink {
            id: uid,
            file_id,
            owner: sender,
            share_token,
            can_download,
            expires_at,
            created_at: ctx.epoch_timestamp_ms(),
        };
        event::emit(PublicLinkCreated {
            link_id,
            file_id,
            share_token,
        });
        transfer::public_transfer(link, sender);
    }
    public fun file_id(cap: &ShareCapability): ID {
        cap.file_id
    }
    public fun shared_by(cap: &ShareCapability): address {
        cap.shared_by
    }
    public fun shared_with(cap: &ShareCapability): address {
        cap.shared_with
    }
    public fun can_write(cap: &ShareCapability): bool {
        cap.can_write
    }
    public fun can_delete(cap: &ShareCapability): bool {
        cap.can_delete
    }
    public fun link_file_id(link: &PublicShareLink): ID {
        link.file_id
    }
    public fun link_owner(link: &PublicShareLink): address {
        link.owner
    }
    public fun share_token(link: &PublicShareLink): String {
        link.share_token
    }
    public fun can_download(link: &PublicShareLink): bool {
        link.can_download
    }
    public fun is_expired(link: &PublicShareLink, current_time: u64): bool {
        if (option::is_some(&link.expires_at)) {
            let expiry = *option::borrow(&link.expires_at);
            current_time > expiry
        } else {
            false
        }
    }
    public entry fun revoke_capability(cap: ShareCapability, ctx: &TxContext) {
        assert!(cap.shared_by == ctx.sender(), ENotOwner);
        let ShareCapability { id, file_id, .. } = cap;
        event::emit(CapabilityRevoked {
            capability_id: object::uid_to_inner(&id),
            file_id,
        });
        object::delete(id);
    }
    public entry fun revoke_public_link(link: PublicShareLink, ctx: &TxContext) {
        assert!(link.owner == ctx.sender(), ENotOwner);
        let PublicShareLink { id, file_id, .. } = link;
        event::emit(PublicLinkRevoked {
            link_id: object::uid_to_inner(&id),
            file_id,
        });
        object::delete(id);
    }
    public entry fun transfer_capability(cap: ShareCapability, new_recipient: address) {
        transfer::public_transfer(cap, new_recipient);
    }
}
