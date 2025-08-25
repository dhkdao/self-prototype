// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {Ownable} from "solady/auth/Ownable.sol";

contract SelfVerification is SelfVerificationRoot, Ownable {
    // Store verification status for each user
    mapping(address => bool) public verifiedHumans;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    // Event to track successful verifications
    event VerificationCompleted(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

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
        lastUserAddress = address(uint160(output.userIdentifier));
        verifiedHumans[lastUserAddress] = true;

        emit VerificationCompleted(output, userData);

        // Add your custom logic here:
        // - Mint NFT to verified user
        // - Add to allowlist
        // - Transfer tokens
        // - etc.
    }

    function getConfigId(
        bytes32 _destinationChainId,
        bytes32 _userIdentifier,
        bytes memory _userDefinedData
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Check if an address is a verified human
     */
    function isVerifiedHuman(address _user) external view returns (bool) {
        return verifiedHumans[_user];
    }

    function setConfigId(bytes32 _configId) external onlyOwner {
        verificationConfigId = _configId;
    }
}
