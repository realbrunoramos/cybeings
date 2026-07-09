import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// USDC helper (6 decimals).
const usdc = (n: number) => ethers.parseUnits(n.toString(), 6);

describe("CybeingsMarket", () => {
  async function deployFixture() {
    const [platform, seller, buyer, other] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await token.waitForDeployment();

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const nft = await MockERC721.deploy();
    await nft.waitForDeployment();

    const Market = await ethers.getContractFactory("CybeingsMarket");
    const market = await Market.deploy(await token.getAddress());
    await market.waitForDeployment();

    // Seller owns NFT #1.
    await nft.mint(seller.address);
    // Buyer is funded with 1000 USDC.
    await token.mint(buyer.address, usdc(1000));

    return { market, token, nft, platform, seller, buyer, other };
  }

  async function listFixture() {
    const ctx = await loadFixture(deployFixture);
    const { market, nft, seller } = ctx;
    const marketAddr = await market.getAddress();
    const nftAddr = await nft.getAddress();

    await nft.connect(seller).approve(marketAddr, 1);
    await market.connect(seller).createListing(nftAddr, 1, usdc(1000));
    return { ...ctx, marketAddr, nftAddr, listingId: 1n };
  }

  describe("createListing", () => {
    it("reverts without prior approval", async () => {
      const { market, nft, seller } = await loadFixture(deployFixture);
      await expect(
        market.connect(seller).createListing(await nft.getAddress(), 1, usdc(100)),
      ).to.be.revertedWithCustomError(market, "MarketNotApproved");
    });

    it("reverts when caller is not the NFT owner", async () => {
      const { market, nft, buyer } = await loadFixture(deployFixture);
      // buyer does not own token #1
      await expect(
        market.connect(buyer).createListing(await nft.getAddress(), 1, usdc(100)),
      ).to.be.revertedWithCustomError(market, "NotTokenOwner");
    });

    it("reverts on zero price", async () => {
      const { market, nft, seller } = await loadFixture(deployFixture);
      await nft.connect(seller).approve(await market.getAddress(), 1);
      await expect(
        market.connect(seller).createListing(await nft.getAddress(), 1, 0),
      ).to.be.revertedWithCustomError(market, "InvalidPrice");
    });

    it("creates a listing and emits ListingCreated", async () => {
      const { market, nft, seller } = await loadFixture(deployFixture);
      const nftAddr = await nft.getAddress();
      await nft.connect(seller).approve(await market.getAddress(), 1);
      await expect(market.connect(seller).createListing(nftAddr, 1, usdc(1000)))
        .to.emit(market, "ListingCreated")
        .withArgs(1, seller.address, nftAddr, 1, usdc(1000));
    });
  });

  describe("buyListing", () => {
    it("transfers the NFT to the buyer", async () => {
      const { market, token, nft, buyer, marketAddr, listingId } = await listFixture();
      await token.connect(buyer).approve(marketAddr, usdc(1000));

      await expect(market.connect(buyer).buyListing(listingId))
        .to.emit(market, "ListingSold")
        .withArgs(listingId, buyer.address, usdc(1000));

      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });

    it("distributes USDC: seller 95%, platform 5%", async () => {
      const { market, token, buyer, seller, platform, marketAddr, listingId } =
        await listFixture();
      await token.connect(buyer).approve(marketAddr, usdc(1000));

      await market.connect(buyer).buyListing(listingId);

      expect(await token.balanceOf(seller.address)).to.equal(usdc(950));
      expect(await token.balanceOf(platform.address)).to.equal(usdc(50));
      expect(await token.balanceOf(buyer.address)).to.equal(0n);
    });

    it("gives the seller the full price when the fee is zero", async () => {
      const { market, token, buyer, seller, platform, marketAddr, listingId } =
        await listFixture();
      await market.connect(platform).setPlatformFee(0);
      await token.connect(buyer).approve(marketAddr, usdc(1000));

      await market.connect(buyer).buyListing(listingId);

      expect(await token.balanceOf(seller.address)).to.equal(usdc(1000));
      expect(await token.balanceOf(platform.address)).to.equal(0n);
    });

    it("reverts buying an already-sold listing", async () => {
      const { market, token, buyer, marketAddr, listingId } = await listFixture();
      await token.connect(buyer).approve(marketAddr, usdc(1000));
      await market.connect(buyer).buyListing(listingId);

      await expect(
        market.connect(buyer).buyListing(listingId),
      ).to.be.revertedWithCustomError(market, "ListingNotActive");
    });

    it("reverts buying a cancelled listing", async () => {
      const { market, token, buyer, seller, marketAddr, listingId } = await listFixture();
      await market.connect(seller).cancelListing(listingId);
      await token.connect(buyer).approve(marketAddr, usdc(1000));

      await expect(
        market.connect(buyer).buyListing(listingId),
      ).to.be.revertedWithCustomError(market, "ListingNotActive");
    });
  });

  describe("cancelListing", () => {
    it("reverts when caller is not the seller", async () => {
      const { market, other, listingId } = await listFixture();
      await expect(
        market.connect(other).cancelListing(listingId),
      ).to.be.revertedWithCustomError(market, "NotSeller");
    });

    it("lets the seller cancel and emits ListingCancelled", async () => {
      const { market, seller, listingId } = await listFixture();
      await expect(market.connect(seller).cancelListing(listingId))
        .to.emit(market, "ListingCancelled")
        .withArgs(listingId);
    });
  });

  describe("setPlatformFee", () => {
    it("reverts above the 10% cap", async () => {
      const { market, platform } = await loadFixture(deployFixture);
      await expect(market.connect(platform).setPlatformFee(1001))
        .to.be.revertedWithCustomError(market, "FeeTooHigh")
        .withArgs(1001);
    });

    it("reverts when a non-owner tries to set the fee", async () => {
      const { market, seller } = await loadFixture(deployFixture);
      await expect(
        market.connect(seller).setPlatformFee(100),
      ).to.be.revertedWithCustomError(market, "OwnableUnauthorizedAccount");
    });

    it("updates the fee at or below the cap and emits", async () => {
      const { market, platform } = await loadFixture(deployFixture);
      await expect(market.connect(platform).setPlatformFee(1000))
        .to.emit(market, "PlatformFeeUpdated")
        .withArgs(1000);
      expect(await market.platformFeeBps()).to.equal(1000);
    });
  });

  describe("reentrancy protection", () => {
    it("blocks a malicious buyer from re-entering buyListing", async () => {
      const { market, token, nft, seller, marketAddr, nftAddr, listingId } =
        await listFixture();

      const Reentrant = await ethers.getContractFactory("ReentrantBuyer");
      const attacker = await Reentrant.deploy(marketAddr, await token.getAddress());
      await attacker.waitForDeployment();
      const attackerAddr = await attacker.getAddress();

      // Fund the attacker contract with enough USDC for one purchase.
      await token.mint(attackerAddr, usdc(1000));

      // The attack performs one honest buy; the reentrant attempt happens
      // inside onERC721Received and must revert.
      await attacker.attack(listingId);

      // Reentrancy was attempted and blocked.
      expect(await attacker.reenteredOnce()).to.equal(true);
      expect(await attacker.reentryReverted()).to.equal(true);

      // The attacker still received exactly one NFT, and funds settled once.
      expect(await nft.ownerOf(1)).to.equal(attackerAddr);
      expect(await token.balanceOf(seller.address)).to.equal(usdc(950));
    });
  });
});
