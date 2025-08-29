// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {SelfVerification} from "../src/SelfVerification.sol";

contract TestVerificationCompletedEvent is Script {
    SelfVerification public sv;

    function run(
        string memory userId,
        string memory nationality,
        string memory userData
    ) public {
        address contractAddr = vm.envAddress("NEXT_PUBLIC_VERIFICATION_DEPLOYED_ADDR");
        sv = SelfVerification(contractAddr);

        vm.startBroadcast();

        sv.testVerificationCompletedEvent(
            vm.parseAddress(userId),
            nationality,
            bytes(userData)
        );

        vm.stopBroadcast();
    }
}
