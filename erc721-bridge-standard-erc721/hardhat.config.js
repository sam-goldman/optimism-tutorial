// Plugins
require('@nomiclabs/hardhat-ethers')

// Load environment variables from .env
require('dotenv').config();

module.exports = {
  networks: {
    'eth-kovan': {
      chainId: 42,
      url: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 15000000,
    },
    'optimistic-kovan': {
      chainId: 69,
      url: 'https://kovan.optimism.io',
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 15000000,
    },
    'optimistic-mainnet': {
      chainId: 10,
      url: 'https://mainnet.optimism.io',
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 15000000,
    }
  },
  solidity: '0.8.9',
}
