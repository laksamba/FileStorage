const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileStorage Contract", function () {
  let FileStorage;
  let fileStorage;
  let owner;
  let addr1;
  let addr2;
  let ipfsHash1;
  let ipfsHash2;

  beforeEach(async function () {
    // Get the contract factory
    FileStorage = await ethers.getContractFactory("FileStorage");

    // Get the signers (accounts)
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    fileStorage = await FileStorage.deploy();
    await fileStorage.waitForDeployment();

    // Example IPFS hashes to test with
    ipfsHash1 = "QmYwAPJzv5CZsnA3Dsd1Sg5t6EBp5nN4bHZXx67dKbTb49";
    ipfsHash2 = "QmXoH3dpYdbgs3se2hCgu1s1g7STZyX7FCq7Sy1kNh6v4h";
  });

  describe("File Upload", function () {
    it("should upload a file and store the IPFS hash", async function () {
      await fileStorage.connect(addr1).uploadFile(ipfsHash1);
      await fileStorage.connect(addr1).uploadFile(ipfsHash2);

      // Get files of addr1
      const files = await fileStorage.connect(addr1).getFiles();
      expect(files.length).to.equal(2);
      expect(files[0]).to.equal(ipfsHash1);
      expect(files[1]).to.equal(ipfsHash2);
    });

    it("should not allow a different user to access files of another user", async function () {
      await fileStorage.connect(addr1).uploadFile(ipfsHash1);

      // addr2 tries to access addr1's files
      const files = await fileStorage.connect(addr2).getFiles();
      expect(files.length).to.equal(0); // addr2 should not have access
    });
  });
});
