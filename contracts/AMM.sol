//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
// [] Manage Pool
// [] Manage Deposits
// [] Facilitate Swaps
// [] Manage Withdrawals

contract AMM {
    Token public token1;
    Token public token2;

    uint256 public token1Balance;
    uint256 public token2Balance;
    uint256 public K;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 constant PRECISION = 10 ** 18;

    constructor(Token _token1, Token _token2) {
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(
        uint256 _token1Amount,
        uint256 _token2Amount
    ) external {
        // deposit tokens
        require(
            token1.transferFrom(msg.sender, address(this), _token1Amount),
            "Failed to transfer token1"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _token2Amount),
            "Failed to transfer token2"
        );
        // issue shares
        uint256 share;
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint256 share1 = (totalShares * _token1Amount) / token1Balance;
            uint256 share2 = (totalShares * _token2Amount) / token2Balance;
            require(share1 / 10 ** 3 == share2 / 10 ** 3);
            share = share1;
        }

        totalShares += share;
        shares[msg.sender] += share;

        // manage pool
        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance;
    }

    function calculateToken2Deposit(
        uint256 _token1Amount
    ) public view returns (uint256) {
        return (_token1Amount * token2Balance) / token1Balance;
    }

    function calculateToken1Deposit(
        uint256 _token2Amount
    ) public view returns (uint256) {
        return (_token2Amount * token1Balance) / token2Balance;
    }

    function swapToken1(
        uint256 _token1Amount
    ) external returns (uint256 token2Amount) {
        uint256 token1After = token1Balance + _token1Amount;
        uint256 token2After = K / token1After;
        token2Amount = token2Balance - token2After;
    }

    function swapToken2() {}
}
