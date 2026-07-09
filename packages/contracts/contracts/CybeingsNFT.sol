// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CybeingsNFT
/// @notice ERC-721 representing a Cybeing. Minting is gated behind MINTER_ROLE
///         so the backend can mint programmatically without being the owner.
contract CybeingsNFT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    enum AbilityType {
        Writing,
        Code,
        Analysis,
        Translation,
        Summarization,
        ImageDescription,
        Math,
        Debate,
        Storytelling,
        MusicDescription,
        Tutoring,
        Coaching
    }

    enum RarityTier {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    struct CybeingData {
        bytes32 seed;
        AbilityType ability;
        RarityTier rarity;
        uint256 mintedAt;
    }

    // Sequential token id, starting at 1.
    uint256 private _nextTokenId = 1;

    mapping(uint256 => CybeingData) private _cybeingData;

    event CybeingMinted(
        uint256 indexed tokenId,
        address indexed to,
        bytes32 seed,
        AbilityType ability,
        RarityTier rarity
    );

    error CybeingDoesNotExist(uint256 tokenId);

    constructor() ERC721("Cybeings", "CYBEING") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint a new Cybeing. Restricted to MINTER_ROLE.
    function mint(
        address to,
        bytes32 seed,
        AbilityType ability,
        RarityTier rarity,
        string memory uri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _cybeingData[tokenId] = CybeingData({
            seed: seed,
            ability: ability,
            rarity: rarity,
            mintedAt: block.timestamp
        });

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CybeingMinted(tokenId, to, seed, ability, rarity);
        return tokenId;
    }

    /// @notice Read the on-chain data for a Cybeing. Reverts if it does not exist.
    function getCybeingData(uint256 tokenId) external view returns (CybeingData memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert CybeingDoesNotExist(tokenId);
        }
        return _cybeingData[tokenId];
    }

    /// @notice Grant MINTER_ROLE to an account (e.g. the backend). Admin only.
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
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
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
