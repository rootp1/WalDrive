module waldrive::blob_store {
    use std::string::{String, utf8};
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    use walrus::blob::Blob;

    /// An app-owned wrapper around a Walrus Blob.
    public struct StoredBlob has key {
        id: UID,
        /// The Walrus blob object. This represents availability on Walrus.
        blob: Blob,
        /// Optional human-friendly metadata.
        name: String,
        mime: String,
    }

    /// Create a new StoredBlob from a Walrus Blob with optional metadata.
    public entry fun create(blob: Blob, name: String, mime: String, ctx: &mut TxContext): StoredBlob {
        StoredBlob { id: object::new(ctx), blob, name, mime }
    }

    /// Convenience constructor with empty metadata.
    public entry fun create_empty_meta(blob: Blob, ctx: &mut TxContext): StoredBlob {
        create(blob, utf8(b""), utf8(b""), ctx)
    }

    /// Read-only access to the underlying Walrus blob.
    public fun blob_ref(sb: &StoredBlob): &Blob { &sb.blob }

    /// Get name metadata.
    public fun name(sb: &StoredBlob): &String { &sb.name }

    /// Get mime metadata.
    public fun mime(sb: &StoredBlob): &String { &sb.mime }

    /// Update metadata.
    public entry fun set_meta(sb: &mut StoredBlob, name: String, mime: String) {
        sb.name = name;
        sb.mime = mime;
    }

    /// Transfer the StoredBlob object to another address.
    public entry fun transfer_to(sb: StoredBlob, recipient: address) {
        transfer::public_transfer(sb, recipient)
    }

    /// Delete and burn the StoredBlob object, returning ownership of the underlying Blob back
    /// to the caller so they can manage it further (e.g., re-wrap, extend, or delete).
    public entry fun unwrap(sb: StoredBlob): Blob {
        let StoredBlob { id, blob, name: _, mime: _ } = sb;
        object::delete(id);
        blob
    }
}
