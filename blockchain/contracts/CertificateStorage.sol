// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract CertificateStorage {
    mapping(bytes32 => bool) public certificateHashes;
    address public owner;

    event CertificateUploaded(bytes32 indexed certHash, address indexed uploader);

    constructor() public {
        owner = msg.sender;
    }

    function uploadCertificate(bytes32 certHash) external {
        certificateHashes[certHash] = true;
        emit CertificateUploaded(certHash, msg.sender);
    }

    function verifyCertificate(bytes32 certHash) external view returns (bool) {
        return certificateHashes[certHash];
    }
}
