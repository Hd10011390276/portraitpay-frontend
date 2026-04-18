/** @type import('hardhat/types').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/fab4f230a0d040f9b0b7454e484d7e7b",
      accounts: process.env.ETH_WALLET_PRIVATE_KEY
        ? [process.env.ETH_WALLET_PRIVATE_KEY]
        : [],
    },
  },
};