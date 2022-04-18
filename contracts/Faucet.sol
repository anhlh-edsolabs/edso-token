// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./EdsoToken.sol";

import "hardhat/console.sol";

contract Faucet is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    // uint256 constant SECONDS_OF_DAY = 86400;
    uint256 constant DAILY_MINT_LIMIT = 10**23;

    EdsoToken public est;
    mapping(address => uint256) public lastRequest;

    uint256 private _durationOfLimit;

    event TokenDropped(address requester, uint256 requestTime);

    function initialize(address token, uint256 durationOfLimit) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        __Pausable_init();

        est = EdsoToken(token);
        _durationOfLimit = durationOfLimit;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function faucet() external {
        // Last request must over 24 hours ago
        require(
            (lastRequest[_msgSender()] + _durationOfLimit) <= block.timestamp,
            "Daily faucet reached"
        );

        // Mint 10000 tokens to msg.sender
        est.mint(_msgSender(), DAILY_MINT_LIMIT);

        // Reset last request of msg.sender
        uint256 requestedTime = block.timestamp;
        lastRequest[_msgSender()] = requestedTime;

        emit TokenDropped(_msgSender(), requestedTime);
    }

    function getNextValidRequestTime(address requester)
        external
        view
        returns (uint256 validTime)
    {
        validTime = lastRequest[requester] != 0
            ? lastRequest[requester] + _durationOfLimit
            : 0;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
