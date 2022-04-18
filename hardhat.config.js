require("dotenv").config()
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");

const MNEMONIC          = process.env.MNEMONIC;
const INFURA_API_KEY    = process.env.INFURA_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BSC_API_KEY       = process.env.BSC_API_KEY;
const BSC_PROVIDER      = process.env.BSC_PROVIDER;
const BSC_TESTNET_PROVIDER = process.env.BSC_TESTNET_PROVIDER;

const TESTNET_DEPLOYER = process.env.TESTNET_DEPLOYER;
const MAINNET_DEPLOYER = process.env.MAINNET_DEPLOYER;
const TESTNET_PK1 = process.env.TESTNET_PK1;
const MAINNET_PK1 = process.env.MAINNET_PK1;

const GAS_PRICE = 5;
const GAS_UNIT = 10 ** 9; // Gwei

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        count: 100
      },
      gasPrice: 10000000000
    },
    bsctest: {
      url: BSC_TESTNET_PROVIDER,
      chainId: 97,
      gasPrice: GAS_PRICE * GAS_UNIT * 2,
      accounts: [TESTNET_PK1],
      from: TESTNET_DEPLOYER
    },
    mainnet: {
      url: BSC_PROVIDER,
      chainId: 56,
      gasPrice: 5000000000,
      accounts: [MAINNET_PK1],
      from: MAINNET_DEPLOYER
    }
  },
  etherscan: {
    apiKey: {
      bsctest: BSC_API_KEY,
      mainnet: BSC_API_KEY,
      rinkeby: ETHERSCAN_API_KEY
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 600000
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: true,
    runOnCompile: false,
    strict: false,
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    gasPrice: GAS_PRICE,
    showMethodSig: false,
    token: "BNB",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  }
};
