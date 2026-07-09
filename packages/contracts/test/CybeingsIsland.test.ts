import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// IslandSize enum: Small=0, Medium=1, Large=2
const SIZE_LARGE = 2;

describe("CybeingsIsland", () => {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Island = await ethers.getContractFactory("CybeingsIsland");
    const island = await Island.deploy();
    await island.waitForDeployment();
    return { island, owner, alice, bob };
  }

  it("mints an island, emits IslandMinted and assigns ownership", async () => {
    const { island, alice } = await loadFixture(deployFixture);

    await expect(island.mint(alice.address, 10, -20, SIZE_LARGE, "ipfs://island-1"))
      .to.emit(island, "IslandMinted")
      .withArgs(1, alice.address, 10, -20, SIZE_LARGE);

    expect(await island.ownerOf(1)).to.equal(alice.address);
    expect(await island.tokenURI(1)).to.equal("ipfs://island-1");
  });

  it("reverts when a non-owner tries to mint", async () => {
    const { island, alice } = await loadFixture(deployFixture);

    await expect(
      island.connect(alice).mint(alice.address, 0, 0, SIZE_LARGE, "ipfs://x"),
    ).to.be.revertedWithCustomError(island, "OwnableUnauthorizedAccount");
  });

  it("returns correct island data via getIslandData", async () => {
    const { island, alice } = await loadFixture(deployFixture);

    await island.mint(alice.address, 42, -7, SIZE_LARGE, "ipfs://island-1");
    const data = await island.getIslandData(1);

    expect(data.coordX).to.equal(42);
    expect(data.coordY).to.equal(-7);
    expect(data.size).to.equal(SIZE_LARGE);
    expect(data.mintedAt).to.be.greaterThan(0);
  });

  it("reverts reading a non-existent island", async () => {
    const { island } = await loadFixture(deployFixture);

    await expect(island.getIslandData(999))
      .to.be.revertedWithCustomError(island, "IslandDoesNotExist")
      .withArgs(999);
  });

  it("increments token ids sequentially from 1", async () => {
    const { island, alice, bob } = await loadFixture(deployFixture);

    await island.mint(alice.address, 1, 1, 0, "ipfs://1");
    await island.mint(bob.address, 2, 2, 1, "ipfs://2");

    expect(await island.ownerOf(1)).to.equal(alice.address);
    expect(await island.ownerOf(2)).to.equal(bob.address);
  });
});
