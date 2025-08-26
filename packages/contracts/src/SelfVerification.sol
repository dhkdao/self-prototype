// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {Ownable} from "solady/auth/Ownable.sol";

contract SelfVerification is SelfVerificationRoot, Ownable {
    // Store no, of times a wallet owner has been verified with a valid ID
    mapping(address => uint32) public verifiedHumans;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    // Event to track successful verifications
    event VerificationCompleted(address indexed sender, string indexed nationality, bytes userData);

    /**
     * @notice Constructor for the contract
     * @param _identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param _scope The scope of the contract
     * @param _verificationConfigId The configuration ID for the contract
     */
    constructor(
        address _identityVerificationHubV2Address,
        uint256 _scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(_identityVerificationHubV2Address, _scope) {
        verificationConfigId = _verificationConfigId;
        _setOwner(msg.sender);
    }

    /**
     * @notice Implementation of customVerificationHook
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        address userId = address(uint160(output.userIdentifier));
        string memory nationality = output.nationality;
        verifiedHumans[userId] += 1;

        emit VerificationCompleted(userId, nationality, userData);

        // Add your custom logic here:
        // - Mint NFT to verified user
        // - Add to allowlist
        // - Transfer tokens
        // - etc.
    }

    function getConfigId(
        bytes32 /* _destinationChainId */,
        bytes32 /* _userIdentifier */,
        bytes memory /* _userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Check if an address is a verified human
     */
    function isVerifiedHuman(address user) external view returns (bool) {
        return verifiedHumans[user] > 0;
    }

    function setConfigId(bytes32 configId) external onlyOwner {
        verificationConfigId = configId;
    }
}
