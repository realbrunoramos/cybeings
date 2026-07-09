import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const SIZE_MEDIUM = 1;

describe("CybeingsFlag", () => {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();

    const Island = await ethers.getContractFactory("CybeingsIsland");
    const island = await Island.deploy();
    await island.waitForDeployment();

    const Flag = await ethers.getContractFactory("CybeingsFlag");
    const flag = await Flag.deploy(await island.getAddress());
    await flag.waitForDeployment();

    // Alice owns island #1.
    await island.mint(alice.address, 5, 5, SIZE_MEDIUM, "ipfs://island-1");

    return { island, flag, owner, alice, bob };
  }

  it("mints a flag for an island owned by `to`, emits FlagMinted", async () => {
    const { flag, alice } = await loadFixture(deployFixture);

    await expect(flag.mint(alice.address, 1, "ipfs://flag-1"))
      .to.emit(flag, "FlagMinted")
      .withArgs(1, 1, alice.address);

    expect(await flag.ownerOf(1)).to.equal(alice.address);
    expect(await flag.flagToIsland(1)).to.equal(1);
    expect(await flag.islandToFlag(1)).to.equal(1);
  });

  it("reverts when a non-owner (of the contract) tries to mint", async () => {
    const { flag, alice } = await loadFixture(deployFixture);

    await expect(
      flag.connect(alice).mint(alice.address, 1, "ipfs://x"),
    ).to.be.revertedWithCustomError(flag, "OwnableUnauthorizedAccount");
  });

  it("reverts minting a flag for a non-existent island", async () => {
    const { flag, alice } = await loadFixture(deployFixture);

    // Island #99 does not exist; islandContract.ownerOf reverts.
    await expect(flag.mint(alice.address, 99, "ipfs://x")).to.be.reverted;
  });

  it("reverts minting a flag to someone who is not the island owner", async () => {
    const { flag, bob } = await loadFixture(deployFixture);

    // Bob is not the owner of island #1 (Alice is).
    await expect(flag.mint(bob.address, 1, "ipfs://x"))
      .to.be.revertedWithCustomError(flag, "NotIslandOwner")
      .withArgs(1, bob.address);
  });

  it("allows replacing a flag: island points at the newest flag", async () => {
    const { flag, alice } = await loadFixture(deployFixture);

    await flag.mint(alice.address, 1, "ipfs://flag-1");
    await flag.mint(alice.address, 1, "ipfs://flag-2");

    // Newest flag is token #2, and the island now points at it.
    expect(await flag.islandToFlag(1)).to.equal(2);
    expect(await flag.ownerOf(2)).to.equal(alice.address);
  });
});
