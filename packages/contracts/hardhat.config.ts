import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Deployment secrets live in the API app's local .env (gitignored), shared
// across the monorepo. Path is relative to this package directory.
dotenv.config({ path: "../../apps/api/.env" });

const SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL ?? "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? "";

// Only attach an account when a key is present, so compiling/testing without
// the .env (e.g. in CI) never crashes on an undefined private key.
const sepoliaAccounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      // OpenZeppelin v5.6 uses the `mcopy` opcode (Cancun). Sepolia and
      // mainnet are Cancun-enabled since Dencun, so this is safe to deploy.
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_URL,
      accounts: sepoliaAccounts,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
