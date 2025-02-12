require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url: process.env.SE_POLIA_URL,
      accounts: [process.env.SE_POLIA_PRIVATE_KEY]
    }
  }
};
