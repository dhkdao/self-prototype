// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ERC20} from "solady/tokens/ERC20.sol";

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
contract ERC20Token is ERC20 {
    function name() public pure override returns (string memory) {
        return "ERC20 Token";
    }
    function symbol() public pure override returns (string memory) {
        return "TOKEN";
    }
}
