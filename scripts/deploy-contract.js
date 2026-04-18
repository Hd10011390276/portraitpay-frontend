/**
 * Deploy PortraitCert.sol to Ethereum Sepolia
 * Uses solc for compilation, ethers.js for deployment
 * Run: ETH_WALLET_PRIVATE_KEY=0x... node scripts/deploy-contract.js
 */

const ethers = require("ethers");
const solc = require("solc");
const fs = require("fs");
const path = require("path");

const RPC_URL = "https://sepolia.infura.io/v3/fab4f230a0d040f9b0b7454e484d7e7b";
const PRIVATE_KEY = process.env.ETH_WALLET_PRIVATE_KEY;

async function compileContract(source) {
  const input = {
    language: "Solidity",
    sources: { "PortraitCert.sol": { content: source } },
    settings: {
      outputSelection: {
        "*": { "*": ["*"] },
      },
    },
  };

  const result = JSON.parse(
    solc.compile(JSON.stringify(input), { import: () => ({ contents: source }) })
  );

  if (result.errors) {
    result.errors.forEach((e) => console.error(e.formattedMessage || e.message));
  }

  const contract = result.contracts["PortraitCert.sol"].PortraitCert;
  if (!contract) throw new Error("Compilation failed: PortraitCert not found");
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

async function main() {
  if (!PRIVATE_KEY) {
    console.error("❌ Missing ETH_WALLET_PRIVATE_KEY");
    console.log("Run: ETH_WALLET_PRIVATE_KEY=0x... node scripts/deploy-contract.js");
    process.exit(1);
  }

  const contractPath = path.join(__dirname, "..", "contracts", "PortraitCert.sol");
  const source = fs.readFileSync(contractPath, "utf8");

  console.log("Compiling PortraitCert.sol...");
  const { abi, bytecode } = await compileContract(source);
  console.log("✅ Compiled successfully");

  console.log("\nConnecting to Sepolia...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Wallet:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Wallet has 0 Sepolia ETH. Get free ETH at https://www.sepolia.io/faucet");
    process.exit(1);
  }

  console.log("\nDeploying PortraitCert...");
  const factory = new ethers.ContractFactory(abi, "0x" + bytecode, wallet);

  const contract = await factory.deploy();
  console.log("Tx submitted:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation (~15 seconds)...");

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ PortraitCert deployed!");
  console.log("   Address:", address);
  console.log("   Etherscan: https://sepolia.etherscan.io/address/" + address);
  console.log("\n📋 Add these to Vercel environment variables:");
  console.log("   PORTRAIT_CERT_CONTRACT_ADDRESS=" + address);
  console.log("   ETHEREUM_SEPOLIA_RPC_URL=" + RPC_URL);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message || e);
  process.exit(1);
});