#[test_only]
module waldrive::file_metadata_tests {
    use waldrive::file_metadata::{Self, FileMetadata};
    use std::string;
    use std::option;
    use sui::test_scenario;
    use sui::transfer;
    #[test]
    fun test_create_file() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let file = file_metadata::create_file(
                string::utf8(b"test.pdf"),
                string::utf8(b"blob123"),
                1024,
                string::utf8(b"application/pdf"),
                option::none(),
                false,
                ctx
            );
            assert!(file_metadata::name(&file) == string::utf8(b"test.pdf"), 0);
            assert!(file_metadata::blob_id(&file) == string::utf8(b"blob123"), 1);
            assert!(file_metadata::size(&file) == 1024, 2);
            assert!(file_metadata::owner(&file) == user, 3);
            transfer::public_transfer(file, user);
        };
        test_scenario::end(scenario);
    }
    #[test]
    fun test_update_file_name() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let file = file_metadata::create_file(
                string::utf8(b"old.pdf"),
                string::utf8(b"blob123"),
                1024,
                string::utf8(b"application/pdf"),
                option::none(),
                false,
                ctx
            );
            transfer::public_transfer(file, user);
        };
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut file = test_scenario::take_from_sender<FileMetadata>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            file_metadata::update_name(&mut file, string::utf8(b"new.pdf"), ctx);
            assert!(file_metadata::name(&file) == string::utf8(b"new.pdf"), 0);
            test_scenario::return_to_sender(&scenario, file);
        };
        test_scenario::end(scenario);
    }
    #[test]
    fun test_toggle_public() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let file = file_metadata::create_file(
                string::utf8(b"test.pdf"),
                string::utf8(b"blob123"),
                1024,
                string::utf8(b"application/pdf"),
                option::none(),
                false,
                ctx
            );
            assert!(!file_metadata::is_public(&file), 0);
            transfer::public_transfer(file, user);
        };
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut file = test_scenario::take_from_sender<FileMetadata>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            file_metadata::toggle_public(&mut file, ctx);
            assert!(file_metadata::is_public(&file), 1);
            test_scenario::return_to_sender(&scenario, file);
        };
        test_scenario::end(scenario);
    }
}
