// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title CybeingsMarket
/// @notice Fixed-price marketplace for Cybeings NFTs, settled in USDC. The
///         platform takes a fee (basis points) on every sale.
contract CybeingsMarket is Ownable, ReentrancyGuard {
    // Immutable USDC token used for settlement.
    IERC20 public immutable usdc;

    // Platform fee in basis points (10000 = 100%). Starts at 5.00%.
    uint16 public platformFeeBps = 500;

    // Hard cap on the fee: never more than 10%.
    uint16 public constant MAX_FEE_BPS = 1000;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 priceUsdc;
        bool active;
    }

    // Sequential listing id, starting at 1.
    uint256 private _nextListingId = 1;

    mapping(uint256 => Listing) public listings;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 priceUsdc
    );
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 priceUsdc);
    event ListingCancelled(uint256 indexed listingId);
    event PlatformFeeUpdated(uint16 newFeeBps);

    error InvalidPrice();
    error NotTokenOwner();
    error MarketNotApproved();
    error ListingNotActive();
    error NotSeller();
    error FeeTooHigh(uint16 newFeeBps);
    error UsdcTransferFailed();

    constructor(address usdc_) Ownable(msg.sender) {
        usdc = IERC20(usdc_);
    }

    /// @notice List an NFT for sale. The caller must own the token and have
    ///         approved this contract to transfer it.
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 priceUsdc
    ) external returns (uint256) {
        if (priceUsdc == 0) {
            revert InvalidPrice();
        }

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }
        if (
            nft.getApproved(tokenId) != address(this) &&
            !nft.isApprovedForAll(msg.sender, address(this))
        ) {
            revert MarketNotApproved();
        }

        uint256 listingId = _nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            priceUsdc: priceUsdc,
            active: true
        });

        emit ListingCreated(listingId, msg.sender, nftContract, tokenId, priceUsdc);
        return listingId;
    }

    /// @notice Buy an active listing. The buyer must have approved this contract
    ///         to spend at least `priceUsdc` USDC beforehand.
    function buyListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        if (!listing.active) {
            revert ListingNotActive();
        }

        uint256 price = listing.priceUsdc;
        uint256 fee = (price * platformFeeBps) / 10000;
        uint256 sellerAmount = price - fee;
        address seller = listing.seller;
        address nftContract = listing.nftContract;
        uint256 tokenId = listing.tokenId;

        // Effects before interactions (checks-effects-interactions),
        // as defence-in-depth alongside nonReentrant.
        listing.active = false;

        // USDC settlement — two separate transferFrom calls. The buyer must
        // have approved this contract for the full price beforehand.
        if (!usdc.transferFrom(msg.sender, seller, sellerAmount)) {
            revert UsdcTransferFailed();
        }
        if (fee > 0) {
            if (!usdc.transferFrom(msg.sender, owner(), fee)) {
                revert UsdcTransferFailed();
            }
        }

        // NFT transfer last (external call that can hand control to the buyer).
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        emit ListingSold(listingId, msg.sender, price);
    }

    /// @notice Cancel a listing. Only the original seller may cancel.
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        if (listing.seller != msg.sender) {
            revert NotSeller();
        }

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    /// @notice Update the platform fee. Owner only, capped at MAX_FEE_BPS.
    function setPlatformFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) {
            revert FeeTooHigh(newFeeBps);
        }
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }
}
