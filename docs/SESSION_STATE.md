# Cybeings — Estado da Sessão

**Última atualização:** 10 Julho 2026
**Sessão #:** 7
**Fase atual:** Fase 1 — Core MVP (Fase 0 CONCLUÍDA)

---

## 🎉 Fase 0 — Fundações: CONCLUÍDA

Todas as camadas de infraestrutura estão em produção e verificadas:
frontend, backend, três bases de dados, CI/CD, e agora smart contracts
deployados e verificados publicamente na Sepolia testnet.

## Estado Geral

O Cybeings tem agora a fundação técnica completa: site público na Vercel,
API Fastify no Railway ligada a Postgres/Redis/MongoDB, pipeline de CI/CD
verde, e 4 smart contracts (ERC-721 x3 + Marketplace) deployados e
verificados na Sepolia. Próximo passo: Fase 1 — Core MVP, começando pela
autenticação SIWE (F1-T1).

---

## Smart Contracts — Sepolia Testnet (chainId 11155111)

| Contrato | Endereço | Etherscan |
|---|---|---|
| CybeingsIsland | `0x5346c211Cfe160bd556e605Acbb1FEd54D07ad5b` | [verificado](https://sepolia.etherscan.io/address/0x5346c211Cfe160bd556e605Acbb1FEd54D07ad5b#code) |
| CybeingsNFT | `0xEaF2CA2d99703c3d0F6A6382362C3428794517B2` | [verificado](https://sepolia.etherscan.io/address/0xEaF2CA2d99703c3d0F6A6382362C3428794517B2#code) |
| CybeingsFlag | `0x2ADDf54aac353eFdaE9a8E7e7902dB695A89DDaA` | [verificado](https://sepolia.etherscan.io/address/0x2ADDf54aac353eFdaE9a8E7e7902dB695A89DDaA#code) |
| CybeingsMarket | `0x205f700fA48Cc73D50B165ACa2570CA0F65923Ee` | [verificado](https://sepolia.etherscan.io/address/0x205f700fA48Cc73D50B165ACa2570CA0F65923Ee#code) |

**USDC (Sepolia):** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
**Wallet de deploy:** `0x403c6EF37E223f0c1733c1Ae7c0f2e89e43F6D0D` (chave privada só em apps/api/.env local, gitignored)
**Fee da plataforma:** 5% (500 bps), limite máximo configurável de 10% (1000 bps)

---

## O que foi feito (histórico das últimas sessões)

### Sessão #7 — 10 Julho 2026 — F0-T8 completa, Fase 0 fechada

**Setup Hardhat:**
- Detetado e resolvido: pnpm instalou Hardhat 3 (incompatível) — fixado em Hardhat 2.28.6 + hardhat-toolbox 5.0.0
- OpenZeppelin v5.6.1, Solidity 0.8.24, evmVersion "cancun" (necessário para opcode mcopy do OZ v5)

**4 contratos implementados (packages/contracts/contracts/):**
- CybeingsIsland (ERC-721, Ownable) — ilhas com coordX/coordY/size
- CybeingsNFT (ERC-721, AccessControl com MINTER_ROLE) — Cybeings com seed/ability/rarity
- CybeingsFlag (ERC-721, Ownable) — bandeiras associadas a ilhas, valida ownership
- CybeingsMarket (Ownable, ReentrancyGuard) — marketplace USDC, fee 5%, proteção de reentrancy testada

**Testes:** 31/31 a passar, incluindo teste de reentrancy no Market (ReentrantBuyer mock)

**Deploy real na Sepolia:** 4 contratos deployados em sequência (Island→NFT→Flag→Market), blocos 11239062-65, wallet 0x403c…d0d

**Verificação Etherscan:** 4/4 verificados publicamente à primeira tentativa

**Bugs encontrados e corrigidos durante o processo:**
- chainId gravado como 0 no deployments/sepolia.json (bug do script, não do deploy) — corrigido derivando do provider real em vez da config estática

**Decisão adiada:** branch `feature/hero-3d` (figura 3D + upgrade Next 15/React 19) continua em aberto, não mergeada em main. Decisão pendente para sessão futura.

**Commits desta sessão:**
- `166e439` — feat(contracts): implement Island, Flag, NFT and Market contracts with full test coverage
- `3d03477` — feat(contracts): deploy Island, NFT, Flag and Market contracts to Sepolia testnet

### Sessão #6 — 6 Julho 2026
- Descoberta de trabalho externo (IA terceira) no frontend: figura 3D + upgrade Next 14→15, React 18→19
- Branch feature/hero-3d criada e enviada, decisão de merge pendente

### Sessões #1-5
- Ver histórico completo nas versões anteriores deste documento (fundações, monorepo, Postgres, Redis, MongoDB, CI/CD, Railway)

---

## Em Curso

**Tarefa:** Nada a meio. Fase 0 fechada em ponto limpo.
**Branch ativa:** main
**Branch pendente de decisão:** feature/hero-3d (não mergeada)

---

## Próximos Passos — Fase 1 (Core MVP)

1. **F1-T1 — Autenticação SIWE** (Sign-In With Ethereum): endpoints
   /auth/nonce e /auth/verify, middleware JWT
2. **F1-T2 — Modal de conexão de wallet:** MetaMask + Coinbase +
   WalletConnect via wagmi + RainbowKit
3. **F1-T3 — Mapa mundial (renderização base):** Canvas 2D, zoom, pan,
   minimapa
4. **Decisão pendente:** merge, manter em paralelo, ou reverter a
   branch feature/hero-3d

---

## Decisões Técnicas Tomadas (permanente)

[Manter tabela completa das sessões anteriores e adicionar:]

| Data | Decisão | Justificação |
|------|---------|--------------|
| Jul 2026 | Hardhat 2.28 (não 3) | v3 é reescrita major incompatível com toolbox maduro; mesmo padrão de "escolher estável" que Prisma v6 |
| Jul 2026 | Solidity 0.8.24, evmVersion cancun | OpenZeppelin v5.6 usa opcode mcopy (Cancun); Sepolia/mainnet suportam desde Dencun (2024) |
| Jul 2026 | Custom errors em vez de require strings | Padrão OZ v5, mais barato em gas, testável com revertedWithCustomError |
| Jul 2026 | AccessControl (MINTER_ROLE) no CybeingsNFT em vez de Ownable | Backend precisa mintar programaticamente sem ser "owner" total |
| Jul 2026 | ReentrancyGuard obrigatório no Market | Única camada com transferência de fundos; testado com mock de atacante |
| Jul 2026 | Fee máxima hardcoded em 1000 bps (10%) | Limite de segurança, mesmo que o owner tente subir mais |
| Jul 2026 | chainId derivado do provider real, não da config | Bug encontrado: config.chainId undefined gerava chainId:0 no JSON de deploy |

---

## Problemas Conhecidos / Blockers

- Nenhum bloqueador ativo na Fase 0.
- Branch `feature/hero-3d` por decidir (merge/manter/reverter).
- TODO menor: adicionar ESLint real ao apps/api (usa tsc --noEmit como proxy).

---

## Configuração do Ambiente

**Repositório:** github.com/realbrunoramos/cybeings (privado)
**Frontend produção:** https://cybeings.vercel.app
**Backend produção:** https://cybeingsapi-production.up.railway.app
**Blockchain:** Sepolia testnet — ver tabela de contratos acima
**Bases de dados:** Supabase (10 tabelas) · Upstash Redis · MongoDB Atlas (3 coleções)
**CI/CD:** GitHub Actions, 3 jobs verdes

---

## Credenciais e Acessos (referências, nunca valores reais)

- GitHub: realbrunoramos (SSH cybeings-sshkey)
- Vercel: ligada via GitHub — projeto cybeings AO VIVO (conector Vercel disponível neste Project)
- Railway: projeto adorable-surprise — serviço @cybeings/api AO VIVO
- Supabase, Upstash, MongoDB Atlas: contas ativas
- Alchemy: conta ativa, app "Bruno's First App", RPC Sepolia configurado
- Etherscan: conta ativa, API key configurada
- Pinata, Cloudinary, Resend: a criar (Fase 1)
