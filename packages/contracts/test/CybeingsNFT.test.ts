import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// AbilityType: Code=1. RarityTier: Rare=2.
const ABILITY_CODE = 1;
const RARITY_RARE = 2;

describe("CybeingsNFT", () => {
  async function deployFixture() {
    const [admin, minter, alice] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("CybeingsNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const seed = ethers.encodeBytes32String("seed-1");
    return { nft, admin, minter, alice, seed };
  }

  it("mints a Cybeing (as deployer/minter), emits CybeingMinted", async () => {
    const { nft, alice, seed } = await loadFixture(deployFixture);

    await expect(nft.mint(alice.address, seed, ABILITY_CODE, RARITY_RARE, "ipfs://c-1"))
      .to.emit(nft, "CybeingMinted")
      .withArgs(1, alice.address, seed, ABILITY_CODE, RARITY_RARE);

    expect(await nft.ownerOf(1)).to.equal(alice.address);
    expect(await nft.tokenURI(1)).to.equal("ipfs://c-1");
  });

  it("reverts when an account without MINTER_ROLE tries to mint", async () => {
    const { nft, minter, alice, seed } = await loadFixture(deployFixture);

    await expect(
      nft.connect(minter).mint(alice.address, seed, ABILITY_CODE, RARITY_RARE, "ipfs://x"),
    ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
  });

  it("returns correct data via getCybeingData", async () => {
    const { nft, alice, seed } = await loadFixture(deployFixture);

    await nft.mint(alice.address, seed, ABILITY_CODE, RARITY_RARE, "ipfs://c-1");
    const data = await nft.getCybeingData(1);

    expect(data.seed).to.equal(seed);
    expect(data.ability).to.equal(ABILITY_CODE);
    expect(data.rarity).to.equal(RARITY_RARE);
    expect(data.mintedAt).to.be.greaterThan(0);
  });

  it("reverts reading a non-existent Cybeing", async () => {
    const { nft } = await loadFixture(deployFixture);

    await expect(nft.getCybeingData(123))
      .to.be.revertedWithCustomError(nft, "CybeingDoesNotExist")
      .withArgs(123);
  });

  it("lets admin grant MINTER_ROLE so a new minter can mint", async () => {
    const { nft, minter, alice, seed } = await loadFixture(deployFixture);

    await nft.grantMinterRole(minter.address);

    await expect(
      nft.connect(minter).mint(alice.address, seed, ABILITY_CODE, RARITY_RARE, "ipfs://c-2"),
    ).to.emit(nft, "CybeingMinted");
  });

  it("reverts when a non-admin tries to grant MINTER_ROLE", async () => {
    const { nft, minter, alice } = await loadFixture(deployFixture);

    await expect(
      nft.connect(alice).grantMinterRole(minter.address),
    ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
  });
});
