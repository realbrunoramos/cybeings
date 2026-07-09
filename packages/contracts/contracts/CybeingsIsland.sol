// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CybeingsIsland
/// @notice ERC-721 representing an island in the Cybeings world. Islands are
///         minted by the contract owner (the backend/deployer for now) and are
///         never burned.
contract CybeingsIsland is ERC721, ERC721URIStorage, Ownable {
    enum IslandSize {
        Small,
        Medium,
        Large
    }

    struct IslandData {
        int32 coordX;
        int32 coordY;
        IslandSize size;
        uint256 mintedAt;
    }

    // Sequential token id, starting at 1.
    uint256 private _nextTokenId = 1;

    mapping(uint256 => IslandData) private _islandData;

    event IslandMinted(
        uint256 indexed tokenId,
        address indexed to,
        int32 coordX,
        int32 coordY,
        IslandSize size
    );

    error IslandDoesNotExist(uint256 tokenId);

    constructor() ERC721("Cybeings Island", "CBISLAND") Ownable(msg.sender) {}

    /// @notice Mint a new island NFT. Restricted to the owner.
    /// @dev The metadata URI param is named `uri` to avoid shadowing tokenURI().
    function mint(
        address to,
        int32 coordX,
        int32 coordY,
        IslandSize size,
        string memory uri
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _islandData[tokenId] = IslandData({
            coordX: coordX,
            coordY: coordY,
            size: size,
            mintedAt: block.timestamp
        });

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit IslandMinted(tokenId, to, coordX, coordY, size);
        return tokenId;
    }

    /// @notice Read the on-chain data for an island. Reverts if it does not exist.
    function getIslandData(uint256 tokenId) external view returns (IslandData memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert IslandDoesNotExist(tokenId);
        }
        return _islandData[tokenId];
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
