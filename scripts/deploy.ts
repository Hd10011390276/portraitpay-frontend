import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PortraitCert to Sepolia...");

  const PortraitCert = await ethers.getContractFactory("PortraitCert");
  const contract = await PortraitCert.deploy();

  console.log("Transaction submitted, waiting for confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ PortraitCert deployed to:", address);

  // Verify arguments
  console.log("\nAdd this to your Vercel/Railway env vars:");
  console.log("  PORTRAIT_CERT_CONTRACT_ADDRESS=" + address);
}

main().catch((e) => {
  console.error("Deployment failed:", e);
  process.exit(1);
});