require("@openzeppelin/hardhat-upgrades");
const hre = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

const tokenBuildName = "EdsoToken";
const faucetBuildName = "Faucet";
const secondsOfDay = 10;

describe("Faucet test", async () => {
    let accounts, minter;
    before("Deployment", async () => {
        accounts = await hre.ethers.getSigners();
        minter = accounts[5];

        let estTokenFactory = await hre.ethers.getContractFactory(
            tokenBuildName
        );
        let estContract = await estTokenFactory.deploy();
        this.estDeployment = await estContract.deployed();

        let faucetFactory = await hre.ethers.getContractFactory(
            faucetBuildName
        );
        let faucetContract = await hre.upgrades.deployProxy(
            faucetFactory,
            [
                this.estDeployment.address,
                secondsOfDay
            ],
            { kind: "uups" }
        );
        this.faucetDeployment = await faucetContract.deployed();

        this.estDeployment.setOperator(this.faucetDeployment.address);
    });
    
    it("Should return operator address", async () => {
        let operator = await this.estDeployment.operator();
        console.log(`Operator : ${operator}`);

        expect(operator).to.equal(this.faucetDeployment.address);
    })

    it(`Should revert with 'Daily faucet reached' on two consecutive mints from the same address within ${secondsOfDay} seconds`, async () => {
        let txn = await this.faucetDeployment.connect(minter).faucet();
        let receipt = await txn.wait();
        // console.log(receipt);
        console.log(`Block number: ${receipt.blockNumber}`);

        let events = getEvents(receipt, "TokenDropped");
        let blockData = await events[0].getBlock(events[0].blockNumber);
        console.log(`Block timestamp: ${blockData.timestamp}`);

        let requester = events[0].args.requester;
        let requestedTime = events[0].args.requestTime;

        console.log(`Requester: ${requester}`);
        console.log(`Requested time: ${requestedTime}`);

        expect(requester).to.equal(minter.address);

        let lastRequest = await this.faucetDeployment.lastRequest(minter.address);
        console.log(`Last request: ${lastRequest}`);
        console.log(`Minter's current balance: ${web3.utils.fromWei((await this.estDeployment.balanceOf(minter.address)).toString(), "ether")}`);

        // Second faucet
        await expect(this.faucetDeployment.connect(minter).faucet())
            .to.be.revertedWith('Daily faucet reached');
    });

    it("Should return next valid request time", async () => {
        let nextValidTime = await this.faucetDeployment.getNextValidRequestTime(minter.address);
        console.log(`Next valid request: ${nextValidTime}`);

        expect((BigNumber.from(await this.faucetDeployment.lastRequest(minter.address))).add(secondsOfDay)).to.equal(nextValidTime.toNumber());
    })

    it("Second faucet should succeed after 10 seconds sleep", async () => {
        await sleep(secondsOfDay * 10 ** 3);
        let txn = await this.faucetDeployment.connect(minter).faucet();
        let receipt = await txn.wait();

        let events = getEvents(receipt, "TokenDropped");
        let blockTime = (await events[0].getBlock(this.blockNumber)).timestamp;
        console.log(`Block time: ${blockTime}`);
        expect(events[0].args.requester).to.equal(minter.address);
        expect(events[0].args.requestTime).to.equal(blockTime);

        console.log(`Minter's current balance: ${web3.utils.fromWei((await this.estDeployment.balanceOf(minter.address)).toString(), "ether")}`);
    })
});

let sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
let getEvents = (txReceipt, eventName) => {
    return txReceipt.events.filter((receipt) => receipt.event == eventName);
}