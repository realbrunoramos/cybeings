// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CybeingsMarket} from "../CybeingsMarket.sol";

/// @notice Test-only malicious buyer that attempts to re-enter buyListing while
///         receiving the NFT via safeTransferFrom. Used to prove the
///         marketplace's reentrancy protection.
contract ReentrantBuyer is IERC721Receiver {
    CybeingsMarket public immutable market;
    IERC20 public immutable usdc;

    uint256 public targetListingId;
    bool public reenteredOnce;
    bool public reentryReverted;

    constructor(address market_, address usdc_) {
        market = CybeingsMarket(market_);
        usdc = IERC20(usdc_);
    }

    /// @notice Kick off the (honest) purchase; the attack happens on receipt.
    function attack(uint256 listingId) external {
        targetListingId = listingId;
        usdc.approve(address(market), type(uint256).max);
        market.buyListing(listingId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4) {
        if (!reenteredOnce) {
            reenteredOnce = true;
            // Attempt to buy the same listing again mid-transfer. The
            // nonReentrant guard must make this revert.
            try market.buyListing(targetListingId) {
                // If this ever succeeds, reentrancy was NOT prevented.
                reentryReverted = false;
            } catch {
                reentryReverted = true;
            }
        }
        return IERC721Receiver.onERC721Received.selector;
    }
}
