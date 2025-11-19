// Test file for Walrus upload
// This is a simple JavaScript file to test the upload functionality

function helloWalrus() {
    console.log("Hello from Walrus decentralized storage!");
    console.log("This file is stored on the Walrus network");
    return "Walrus is working!";
}

// Test data
const testData = {
    name: "WalDrive Test",
    timestamp: new Date().toISOString(),
    features: [
        "Decentralized storage",
        "File upload",
        "Folder organization",
        "Public/private sharing"
    ]
};

// Export the function
export { helloWalrus, testData };
