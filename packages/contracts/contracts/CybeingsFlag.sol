// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title CybeingsFlag
/// @notice ERC-721 representing an island's flag. A flag is tied to an island
///         and can only be minted to that island's current owner. Replacing a
///         flag simply points the island at the new flag; history lives in
///         emitted events.
contract CybeingsFlag is ERC721, ERC721URIStorage, Ownable {
    // Immutable reference to the island collection.
    IERC721 public immutable islandContract;

    // Sequential token id, starting at 1.
    uint256 private _nextTokenId = 1;

    // flag tokenId => island tokenId it belongs to
    mapping(uint256 => uint256) public flagToIsland;

    // island tokenId => current flag tokenId (0 means none yet)
    mapping(uint256 => uint256) public islandToFlag;

    event FlagMinted(uint256 indexed tokenId, uint256 indexed islandTokenId, address indexed to);

    error NotIslandOwner(uint256 islandTokenId, address expectedOwner);

    constructor(address islandContract_) ERC721("Cybeings Flag", "CBFLAG") Ownable(msg.sender) {
        islandContract = IERC721(islandContract_);
    }

    /// @notice Mint a flag for an island. Restricted to the owner.
    /// @dev `islandContract.ownerOf` reverts if the island does not exist,
    ///      which also covers the "island must exist" requirement.
    function mint(
        address to,
        uint256 islandTokenId,
        string memory uri
    ) external onlyOwner returns (uint256) {
        // Reverts (ERC721NonexistentToken) if the island does not exist.
        address islandOwner = islandContract.ownerOf(islandTokenId);
        if (islandOwner != to) {
            revert NotIslandOwner(islandTokenId, to);
        }

        uint256 tokenId = _nextTokenId++;

        flagToIsland[tokenId] = islandTokenId;
        islandToFlag[islandTokenId] = tokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit FlagMinted(tokenId, islandTokenId, to);
        return tokenId;
    }

    // ── Overrides required by Solidity (multiple inheritance) ──────────────

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
