// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EdsoToken is Ownable, Pausable, ERC20 {
    address public operator;

    constructor() 
        ERC20("EDSO-TEST", "EST") {}

    modifier onlyOperator() {
        require(_msgSender() == operator, "Only operator");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "Setting operator to the zero address");
        operator = _operator;
    }

    function mint(address to, uint256 amount) public onlyOperator {
        _mint(to, amount);
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    function approve(address spender, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.approve(spender, amount);
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.decreaseAllowance(spender, subtractedValue);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
