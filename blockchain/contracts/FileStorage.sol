//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FileStorage {
    event FileUploaded(address indexed user, string ipfsHash);
    
    string[] public uploadedFiles;

    function uploadFile(string memory _ipfsHash) public {
        uploadedFiles.push(_ipfsHash);
        emit FileUploaded(msg.sender, _ipfsHash);
    }

    function getFiles() public view returns (string[] memory) {
        return uploadedFiles;
    }
}
