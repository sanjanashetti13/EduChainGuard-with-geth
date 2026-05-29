pragma solidity ^0.5.0;

contract CertificateVerifier {

    struct Certificate {
        string studentName;
        string course;
        string issuer;
        uint256 issueDate;
        bool isValid;
    }

    mapping(string => Certificate) private certificates;

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Add a new certificate
    function addCertificate(
        string memory _certId,
        string memory _studentName,
        string memory _course,
        string memory _issuer
    ) public onlyOwner {

        certificates[_certId] = Certificate(
            _studentName,
            _course,
            _issuer,
            now,
            true
        );
    }

    // Verify certificate
    function verifyCertificate(string memory _certId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        Certificate memory cert = certificates[_certId];

        return (
            cert.studentName,
            cert.course,
            cert.issuer,
            cert.issueDate,
            cert.isValid
        );
    }

    // Revoke certificate
    function revokeCertificate(string memory _certId) public onlyOwner {
        certificates[_certId].isValid = false;
    }
}