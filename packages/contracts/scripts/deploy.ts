import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ethers, network } from "hardhat";

// Circle USDC on Sepolia testnet.
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Network: ${network.name}`);

  // a) CybeingsIsland
  const Island = await ethers.getContractFactory("CybeingsIsland");
  const island = await Island.deploy();
  await island.waitForDeployment();
  const islandAddress = await island.getAddress();
  console.log(`CybeingsIsland deployed: ${islandAddress}`);

  // b) CybeingsNFT
  const NFT = await ethers.getContractFactory("CybeingsNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`CybeingsNFT deployed: ${nftAddress}`);

  // c) CybeingsFlag — depends on the Island address
  const Flag = await ethers.getContractFactory("CybeingsFlag");
  const flag = await Flag.deploy(islandAddress);
  await flag.waitForDeployment();
  const flagAddress = await flag.getAddress();
  console.log(`CybeingsFlag deployed: ${flagAddress}`);

  // d) CybeingsMarket — references the USDC token
  const Market = await ethers.getContractFactory("CybeingsMarket");
  const market = await Market.deploy(USDC_SEPOLIA);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log(`CybeingsMarket deployed: ${marketAddress}`);

  // Derive the chain id from the live provider rather than the static config,
  // which may omit chainId for a network.
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  const deployment = {
    network: network.name,
    chainId,
    deployedAt: new Date().toISOString(),
    contracts: {
      CybeingsIsland: islandAddress,
      CybeingsNFT: nftAddress,
      CybeingsFlag: flagAddress,
      CybeingsMarket: marketAddress,
    },
    usdcAddress: USDC_SEPOLIA,
  };

  const outDir = join(__dirname, "..", "deployments");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${network.name}.json`);
  writeFileSync(outFile, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(`Deployment written to: ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
