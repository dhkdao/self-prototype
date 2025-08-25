// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {SelfVerification} from "../src/SelfVerification.sol";

contract SelfVerificationTest is Test {
    SelfVerification public sv;

    function setUp() public {
        address idHubAddr = vm.envAddress("ID_HUB_ADDR");
        uint256 scope = vm.envUint("SELF_SCOPE");
        bytes32 configId = vm.envBytes32("SELF_CONFIG_ID");

        sv = new SelfVerification(idHubAddr, scope, configId);
    }

    function test_ConfigId() public {
        bytes32 chainId = bytes32(0);
        bytes32 userId = bytes32(0);
        bytes memory data = bytes("0x");

        bytes32 expectedConfigId = vm.envBytes32("SELF_CONFIG_ID");

        bytes32 configId = sv.getConfigId(chainId, userId, data);
        assertEq(configId, expectedConfigId);
    }
}
