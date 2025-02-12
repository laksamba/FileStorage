const hre = require("hardhat");

async function main(){
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);

    const FileStorage = await hre.ethers.getContractFactory("FileStorage");
    const fileStorage = await FileStorage.deploy();
    await fileStorage.waitForDeployment();

    console.log("FileStorage deployed to: ", await fileStorage.getAddress());
}

main().catch((error)=>{
    console.error(error);
    process.exit(1);
})

// Deploying contracts with the account:  0xb18Db4178FeACde282B0d36249eA587c80A638Fd       
// FileStorage deployed to:  0xDa9d15811C266a63da4F199c59e769bE621bc4e4