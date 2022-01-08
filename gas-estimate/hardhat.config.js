require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      }
    },
    optimism: {
      url: 'http://127.0.0.1:8545',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      },
    },
    "optimism-l1": {
      url: 'http://127.0.0.1:9545',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      },
    },
    "optimism-mainnet": {
      url: 'https://mainnet.optimism.io',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      },
    },

  },
  solidity: "0.8.4",
};
