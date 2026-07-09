// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Test-only ERC721 with a public mint, used to list arbitrary NFTs
///         on the marketplace in local tests.
contract MockERC721 is ERC721 {
    uint256 private _nextTokenId = 1;

    constructor() ERC721("Mock NFT", "MOCK") {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
}
