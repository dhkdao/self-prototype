// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SelfVerification} from "../src/SelfVerification.sol";

contract SelfVerificationScript is Script {
    SelfVerification public sv;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_SK");

        // what's needed to deploy SelfVerification
        address idHubAddr = vm.envAddress("ID_HUB_ADDR");
        uint256 scope = vm.envUint("SELF_SCOPE");
        bytes32 configId = vm.envBytes32("SELF_CONFIG_ID");


        vm.startBroadcast(deployerPrivateKey);

        sv = new SelfVerification(idHubAddr, scope, configId);

        console.log("YourContract deployed at:", address(sv));

        vm.stopBroadcast();
    }
}
