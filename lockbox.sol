pragma solidity ^0.5.0;

contract Lock {

    address public owner = msg.sender;

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    struct Member {
        bool active;
        address publicKey;
    }

    mapping(address => Member) public memberAddresses;
    Member[] public members;



    function addMember(address a) public isOwner {
      Member memory m = Member(true, a);
      members.push(m);
      memberAddresses[m.publicKey] = m;
    }

    function getMemberStatus(address memberAddress) public view returns(bool isIndeed) {
        return memberAddresses[memberAddress].active;
    }

    function generateMessage() public view returns (bytes32) {
        return blockhash(block.number-1);
    }

    function verifySignature(uint8 v, bytes32 r, bytes32 s) public view
                 returns (address signer) {

        bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", generateMessage()));

        return ecrecover(messageDigest, v, r, s);
    }

    function unlock(uint8 v, bytes32 r, bytes32 s) public view
                 returns (bool authorized) {
                     
        bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", generateMessage()));
        address signer = ecrecover(messageDigest, v, r, s);
        return getMemberStatus(signer);
    }
}