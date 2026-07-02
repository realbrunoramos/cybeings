# Cybeings — Arquitectura Técnica Completa
> Plataforma Web de Seres Digitais com IA, Mundo Interactivo e Economia Cripto

> **Nota:** Este é o documento de referência da arquitectura (v1.0, Junho 2026).
> Desvios operacionais posteriores — ex.: Prisma fixado na v6, `directUrl` no
> datasource — estão registados no CLAUDE.md e no docs/SESSION_STATE.md, que
> prevalecem sobre este documento em caso de conflito.

---

## Índice

1. [Visão Geral da Arquitectura](#1-visão-geral-da-arquitectura)
2. [Ambiente de Desenvolvimento](#2-ambiente-de-desenvolvimento)
3. [Frontend](#3-frontend)
4. [Backend & API](#4-backend--api)
5. [Base de Dados](#5-base-de-dados)
6. [Blockchain & Smart Contracts](#6-blockchain--smart-contracts)
7. [IA & Geração de Cybeings](#7-ia--geração-de-cybeings)
8. [Armazenamento de Ficheiros](#8-armazenamento-de-ficheiros)
9. [Infraestrutura Cloud](#9-infraestrutura-cloud)
10. [Segurança](#10-segurança)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Monitorização & Observabilidade](#12-monitorização--observabilidade)
13. [Fluxos Críticos do Sistema](#13-fluxos-críticos-do-sistema)
14. [Estimativa de Custos Cloud](#14-estimativa-de-custos-cloud)
15. [Roadmap Técnico por Fase](#15-roadmap-técnico-por-fase)

---

## 1. Visão Geral da Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          UTILIZADOR                                  │
│                   Browser / Mobile Web                               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────────────┐
│                    CDN — Cloudflare                                   │
│         Edge Cache · DDoS Protection · WAF · SSL                     │
└──────────┬──────────────────────────────┬───────────────────────────┘
           │                              │
┌──────────▼──────────┐       ┌───────────▼──────────────┐
│   FRONTEND          │       │   BACKEND API            │
│   Next.js 14        │       │   Node.js + Fastify      │
│   Vercel            │       │   Railway / Render        │
│                     │       │                          │
│  - Mapa Mundial     │◄─────►│  - REST API              │
│  - Ilha & Cybeings  │       │  - WebSocket Server      │
│  - Torneios         │       │  - Auth (SIWE)           │
│  - Marketplace      │       │  - Queue Manager         │
└─────────────────────┘       └──────┬───────────────────┘
                                     │
          ┌──────────────────────────┼────────────────────────────┐
          │                          │                            │
┌─────────▼──────┐        ┌──────────▼───────┐        ┌──────────▼──────┐
│  PostgreSQL     │        │   Redis           │        │  MongoDB         │
│  (Supabase)     │        │   (Upstash)       │        │  (Atlas)         │
│                 │        │                   │        │                  │
│ - Utilizadores  │        │ - Sessions        │        │ - Logs IA        │
│ - Ilhas         │        │ - Cache API       │        │ - Histórico chat  │
│ - Transacções   │        │ - Leaderboard     │        │ - Lore/Eventos    │
│ - Torneios      │        │ - Pub/Sub WS      │        │ - Analytics       │
└─────────────────┘        └───────────────────┘        └──────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                                  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Blockchain   │  │  IA Services │  │  IPFS/Files  │               │
│  │  Ethereum/    │  │  OpenAI API  │  │  Pinata      │               │
│  │  Solana RPC   │  │  Replicate   │  │  Cloudinary  │               │
│  │  Alchemy      │  │  (Img gen)   │  │              │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

**Princípios de design:**
- **Cloud-native** — zero infraestrutura local, tudo gerido em cloud
- **Serverless onde possível** — escala automática, paga pelo uso
- **Separation of concerns** — cada serviço tem uma responsabilidade clara
- **Web3-ready** — blockchain integrada desde o início, não adicionada depois

---

## 2. Ambiente de Desenvolvimento

### GitHub + GitHub Codespaces (VS Code na cloud)

Todo o código vive no GitHub. Os developers trabalham directamente no browser com Codespaces — equivalente ao VS Code mas sem instalar nada localmente.

```
Repositório GitHub (monorepo)
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Node.js backend
├── packages/
│   ├── contracts/        # Smart contracts Solidity/Anchor
│   ├── shared/           # Types e utilitários partilhados
│   └── ui/               # Design system (componentes React)
├── .devcontainer/        # Config Codespaces
│   └── devcontainer.json
├── .github/
│   ├── workflows/        # CI/CD pipelines
│   └── CODEOWNERS
└── docker-compose.yml    # Ambiente local alternativo
```

**Configuração `.devcontainer/devcontainer.json`:**
```json
{
  "name": "Cybeings Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "20" },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "forwardPorts": [3000, 4000, 5432, 6379],
  "postCreateCommand": "npm install -g pnpm && pnpm install",
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "Hardhat.hardhat-vscode"
  ]
}
```

**Gestão de pacotes:** `pnpm workspaces` — mais rápido que npm, partilha dependências entre apps do monorepo.

**Variáveis de ambiente:** GitHub Secrets para produção. `.env.local` para desenvolvimento local. Nunca commitadas no repositório.

---

## 3. Frontend

### Stack: Next.js 14 + TypeScript + Tailwind CSS

**Porquê Next.js 14:**
- App Router com React Server Components — páginas estáticas servidas instantaneamente
- Rendering híbrido: SSG para páginas públicas, SSR para dados em tempo real, CSR para o mapa interactivo
- API Routes integradas para endpoints simples
- Deploy automático na Vercel com preview por PR

**Estrutura de pastas:**
```
apps/web/
├── app/
│   ├── (auth)/
│   │   └── connect/          # Página de ligação de wallet
│   ├── world/                # Mapa mundial (CSR puro)
│   ├── island/
│   │   ├── [id]/             # Página de ilha individual
│   │   └── create/           # Compra de nova ilha
│   ├── cybeing/
│   │   ├── [id]/             # Perfil do Cybeing
│   │   └── mint/             # Criação de novo Cybeing
│   ├── marketplace/          # Compra/venda
│   ├── tournament/           # Torneios e duelos
│   └── api/                  # API Routes Next.js (lightweight)
├── components/
│   ├── world/
│   │   ├── WorldMap.tsx      # Canvas WebGL do mapa
│   │   ├── Island.tsx        # Componente de ilha
│   │   └── Minimap.tsx       # Minimapa
│   ├── cybeing/
│   │   ├── CybeingCard.tsx
│   │   └── CybeingChat.tsx   # Interface de conversa
│   ├── wallet/
│   │   ├── ConnectModal.tsx  # Modal de ligação
│   │   └── WalletStatus.tsx
│   └── ui/                   # Design system
├── hooks/
│   ├── useWallet.ts          # Estado da wallet
│   ├── useWebSocket.ts       # Conexão WS em tempo real
│   └── useIsland.ts
├── lib/
│   ├── wagmi.ts              # Config wallet Web3
│   ├── api.ts                # Cliente HTTP tipado
│   └── constants.ts
└── public/
    └── assets/
```

**Bibliotecas principais:**
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "wagmi": "2.x",
    "viem": "2.x",
    "@rainbow-me/rainbowkit": "2.x",
    "three": "0.x",
    "zustand": "4.x",
    "tanstack/react-query": "5.x",
    "socket.io-client": "4.x",
    "framer-motion": "11.x"
  }
}
```

**Mapa Mundial — Renderização com WebGL (Three.js/Canvas):**

O mapa usa Canvas 2D para o protótipo e migra para WebGL com Three.js na produção para suportar milhares de ilhas sem quebrar performance. O tile system carrega apenas as ilhas visíveis no viewport actual, com lazy loading à medida que o utilizador navega.

**Gestão de estado global (Zustand):**
```typescript
interface WorldStore {
  camera: { x: number; y: number; zoom: number };
  islands: Map<string, Island>;
  selectedIsland: Island | null;
  wallet: WalletState;
  setCam: (cam: Partial<CamState>) => void;
  loadIslandsInView: (bounds: ViewBounds) => Promise<void>;
}
```

**Deploy: Vercel**
- Preview deployment automático em cada Pull Request
- Production deployment em merge para `main`
- Edge Network global — latência mínima em qualquer continente
- Analytics e Core Web Vitals integrados

---

## 4. Backend & API

### Stack: Node.js 20 + Fastify + TypeScript

**Porquê Fastify em vez de Express:**
- 2-3x mais rápido em throughput
- Schema validation nativa com JSON Schema / Zod
- Plugin system robusto
- TypeScript first

**Estrutura da API:**
```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/             # SIWE authentication
│   │   ├── island/           # CRUD ilhas
│   │   ├── cybeing/          # CRUD & IA Cybeings
│   │   ├── tournament/       # Lógica de torneios
│   │   ├── marketplace/      # Listagens & transacções
│   │   ├── wallet/           # Integração blockchain
│   │   └── upload/           # Upload de imagens
│   ├── workers/              # Background jobs
│   │   ├── cybeing.worker.ts # Geração assíncrona de Cybeings
│   │   ├── image.worker.ts   # Processamento de imagens
│   │   └── tournament.worker.ts
│   ├── lib/
│   │   ├── prisma.ts         # Cliente base de dados
│   │   ├── redis.ts          # Cliente cache
│   │   ├── queue.ts          # BullMQ job queues
│   │   ├── blockchain.ts     # Alchemy SDK
│   │   └── ai.ts             # OpenAI client
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── rateLimit.ts      # Rate limiting por wallet
│   │   └── validate.ts
│   ├── websocket/
│   │   └── server.ts         # Socket.io para eventos real-time
│   └── app.ts                # Bootstrap Fastify
├── prisma/
│   ├── schema.prisma         # Schema base de dados
│   └── migrations/
└── tests/
```

**Endpoints principais:**
```
AUTH
POST   /auth/nonce            # Gerar nonce para SIWE
POST   /auth/verify           # Verificar assinatura e emitir JWT
DELETE /auth/logout

ISLANDS
GET    /islands               # Listar ilhas (paginado, por bounds)
POST   /islands               # Comprar nova ilha
GET    /islands/:id           # Detalhe de ilha
PATCH  /islands/:id           # Actualizar ilha (capa, nome)
POST   /islands/:id/flag      # Upload de bandeira (370x370px)

CYBEINGS
GET    /cybeings              # Listar Cybeings (com filtros)
POST   /cybeings/mint         # Criar novo Cybeing
GET    /cybeings/:id          # Detalhe de Cybeing
POST   /cybeings/:id/chat     # Interagir com Cybeing
GET    /cybeings/:id/history  # Histórico de interacções

TOURNAMENT
GET    /tournaments           # Torneios activos
POST   /tournaments/:id/enter # Inscrever Cybeing
GET    /tournaments/:id/match # Estado do duelo em curso
POST   /tournaments/challenge # Desafio 1v1

MARKETPLACE
GET    /listings              # Listagens activas
POST   /listings              # Colocar à venda
POST   /listings/:id/buy      # Comprar
POST   /listings/:id/rent     # Alugar
```

**WebSocket — eventos em tempo real:**
```typescript
// Eventos emitidos pelo servidor
'island:updated'      // Capa ou bandeira alterada
'cybeing:evolved'     // Cybeing subiu de nível
'tournament:started'  // Torneio começou
'tournament:result'   // Resultado de duelo
'world:event'         // Evento global (tempestade, etc.)
'market:sale'         // Venda concluída no marketplace
```

**Background Jobs — BullMQ + Redis:**
```typescript
// Filas de processamento assíncrono
const queues = {
  cybeingGeneration: new Queue('cybeing:gen'),   // Gerar aparência + habilidade
  imageProcessing: new Queue('image:process'),    // Processar uploads
  tournamentEval: new Queue('tournament:eval'),   // Avaliar resultados
  nftMint: new Queue('nft:mint'),                // Mintar tokens na blockchain
  xpRewards: new Queue('xp:rewards'),            // Distribuir XP e recompensas
}
```

**Deploy: Railway**
- Suporta Node.js, auto-scaling horizontal
- Deploy via Git push
- Environment variables seguras
- Logs e métricas integrados
- Alternativa: Render (similar, com free tier generoso para staging)

---

## 5. Base de Dados

### Arquitectura Multi-Base: PostgreSQL + Redis + MongoDB

---

### 5.1 PostgreSQL via Supabase — Base de dados principal

**Porquê Supabase:**
- PostgreSQL gerido com backups automáticos
- Row Level Security (RLS) nativa — segurança a nível de linha
- Realtime subscriptions integradas
- Auth e Storage como bonus
- Dashboard visual para gestão
- Free tier generoso para desenvolvimento

**Schema Principal (Prisma):**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── UTILIZADORES ─────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  username      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  islands       Island[]
  cybeings      Cybeing[]
  listings      Listing[]
  bids          Bid[]
  sentChallenges    Tournament[] @relation("Challenger")
  receivedChallenges Tournament[] @relation("Opponent")

  @@index([walletAddress])
}

// ─── ILHAS ────────────────────────────────────────────────────

model Island {
  id            String      @id @default(cuid())
  name          String
  ownerId       String
  owner         User        @relation(fields: [ownerId], references: [id])

  // Geometria e posição no mundo
  coordX        Float
  coordY        Float
  sizeType      IslandSize  // SMALL | MEDIUM | LARGE
  shapeData     Json        // Array de pontos do polígono gerado aleatoriamente
  maxCybeings   Int         // 5 | 15 | 35

  // Identidade visual
  coverImageUrl String?     // URL IPFS da foto de capa
  coverImageCid String?     // CID IPFS
  flagImageUrl  String?     // URL IPFS da bandeira 370x370
  flagImageCid  String?     // CID IPFS
  flagTokenId   String?     // Token ID da bandeira na blockchain

  // Metadados
  purchasePrice Decimal     // Preço pago em USDC
  purchaseTxHash String?    // Hash da transacção de compra
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  cybeings      Cybeing[]
  flagHistory   FlagHistory[]

  @@index([coordX, coordY])  // Queries espaciais por bounds
  @@index([ownerId])
}

enum IslandSize {
  SMALL
  MEDIUM
  LARGE
}

model FlagHistory {
  id          String   @id @default(cuid())
  islandId    String
  island      Island   @relation(fields: [islandId], references: [id])
  flagUrl     String
  flagCid     String
  setAt       DateTime @default(now())
  previousOwner String?
}

// ─── CYBEINGS ─────────────────────────────────────────────────

model Cybeing {
  id              String        @id @default(cuid())
  tokenId         String        @unique   // NFT token ID on-chain
  ownerId         String
  owner           User          @relation(fields: [ownerId], references: [id])
  islandId        String?
  island          Island?       @relation(fields: [islandId], references: [id])

  // Identidade
  name            String
  imageUrl        String        // URL IPFS da imagem gerada
  imageCid        String        // CID IPFS
  seed            String        // Seed de geração (reproduzível)

  // Habilidade
  abilityType     AbilityType
  abilityName     String        // Nome descritivo da habilidade
  abilityConfig   Json          // Configuração específica da habilidade

  // Personalidade (usado como system prompt da IA)
  personalityTraits Json        // Array de traços
  lore            String?       // História/background gerado
  speechStyle     String?       // Estilo de fala

  // Raridade
  rarityScore     Float         // 0-100
  rarityTier      RarityTier    // COMMON | UNCOMMON | RARE | EPIC | LEGENDARY

  // Progressão
  level           Int           @default(1)
  xp              Int           @default(0)
  xpToNextLevel   Int           @default(100)
  totalInteractions Int         @default(0)

  // Estado
  isForSale       Boolean       @default(false)
  isForRent       Boolean       @default(false)
  rentPriceHour   Decimal?
  mintTxHash      String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  listings        Listing[]
  tournamentEntries TournamentEntry[]
  rentals         Rental[]

  @@index([ownerId])
  @@index([abilityType])
  @@index([rarityTier])
  @@index([islandId])
}

enum AbilityType {
  WRITING
  CODE
  ANALYSIS
  TRANSLATION
  SUMMARIZATION
  IMAGE_DESCRIPTION
  MATH
  DEBATE
  STORYTELLING
  MUSIC_DESCRIPTION
  TUTORING
  COACHING
}

enum RarityTier {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}

// ─── MARKETPLACE ──────────────────────────────────────────────

model Listing {
  id            String        @id @default(cuid())
  cybeingId     String
  cybeing       Cybeing       @relation(fields: [cybeingId], references: [id])
  sellerId      String
  seller        User          @relation(fields: [sellerId], references: [id])

  listingType   ListingType   // SALE | RENT
  priceUsdc     Decimal
  rentDurationH Int?          // Duração em horas (para aluguer)

  status        ListingStatus @default(ACTIVE)
  buyerId       String?
  soldAt        DateTime?
  txHash        String?

  createdAt     DateTime      @default(now())
  expiresAt     DateTime?

  bids          Bid[]

  @@index([status])
  @@index([cybeingId])
  @@index([listingType])
}

enum ListingType { SALE RENT }
enum ListingStatus { ACTIVE SOLD CANCELLED EXPIRED }

model Bid {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id])
  bidderId    String
  bidder      User     @relation(fields: [bidderId], references: [id])
  amountUsdc  Decimal
  status      BidStatus @default(PENDING)
  createdAt   DateTime  @default(now())
}

enum BidStatus { PENDING ACCEPTED REJECTED EXPIRED }

// ─── TORNEIOS ────────────────────────────────────────────────

model Tournament {
  id              String            @id @default(cuid())
  title           String
  abilityType     AbilityType
  tournamentType  TournamentType    // DUEL | WEEKLY | MONTHLY | EVENT
  status          TournamentStatus  @default(OPEN)

  challengerId    String?
  challenger      User?             @relation("Challenger", fields: [challengerId], references: [id])
  opponentId      String?
  opponent        User?             @relation("Opponent", fields: [opponentId], references: [id])

  challenge       String            // O enunciado do desafio
  prizePoolUsdc   Decimal           @default(0)
  platformFee     Decimal           @default(0.05)   // 5%

  winnerId        String?
  result          Json?             // Scores, avaliações detalhadas

  startedAt       DateTime?
  endedAt         DateTime?
  createdAt       DateTime          @default(now())

  entries         TournamentEntry[]

  @@index([status])
  @@index([abilityType])
}

model TournamentEntry {
  id            String     @id @default(cuid())
  tournamentId  String
  tournament    Tournament @relation(fields: [tournamentId], references: [id])
  cybeingId     String
  cybeing       Cybeing    @relation(fields: [cybeingId], references: [id])
  stakeUsdc     Decimal
  output        String?    // Output gerado pelo Cybeing no desafio
  aiScore       Float?     // Score dado pela IA (0-100)
  communityVotes Int       @default(0)
  finalScore    Float?
  placement     Int?
  createdAt     DateTime   @default(now())
}

enum TournamentType   { DUEL WEEKLY MONTHLY EVENT }
enum TournamentStatus { OPEN IN_PROGRESS EVALUATING COMPLETED CANCELLED }

// ─── ALUGUERES ───────────────────────────────────────────────

model Rental {
  id          String   @id @default(cuid())
  cybeingId   String
  cybeing     Cybeing  @relation(fields: [cybeingId], references: [id])
  renterId    String
  priceUsdc   Decimal
  startAt     DateTime
  endAt       DateTime
  txHash      String?
  createdAt   DateTime @default(now())

  @@index([cybeingId])
  @@index([renterId])
}

// ─── TRANSACÇÕES ─────────────────────────────────────────────

model Transaction {
  id            String          @id @default(cuid())
  fromAddress   String
  toAddress     String?
  type          TransactionType
  amountUsdc    Decimal?
  txHash        String          @unique
  blockNumber   BigInt?
  status        TxStatus        @default(PENDING)
  metadata      Json?
  createdAt     DateTime        @default(now())
  confirmedAt   DateTime?

  @@index([fromAddress])
  @@index([txHash])
  @@index([status])
}

enum TransactionType {
  ISLAND_PURCHASE
  CYBEING_MINT
  MARKETPLACE_SALE
  RENTAL_PAYMENT
  TOURNAMENT_ENTRY
  TOURNAMENT_REWARD
  FLAG_MINT
}

enum TxStatus { PENDING CONFIRMED FAILED }
```

---

### 5.2 Redis via Upstash — Cache & Tempo Real

**Porquê Upstash:**
- Redis serverless — paga por request, não por servidor
- Latência global com edge nodes
- Sem gestão de servidores
- Integração perfeita com Vercel e Railway

**Padrões de uso:**

```typescript
// Sessions de utilizador (TTL: 7 dias)
await redis.setex(`session:${userId}`, 604800, JSON.stringify(sessionData));

// Cache de tiles do mapa (TTL: 60 segundos)
// Bounds do viewport divididos em tiles de 100x100 unidades
await redis.setex(`map:tile:${tileX}:${tileY}`, 60, JSON.stringify(islands));

// Leaderboard de torneios (Sorted Set nativo do Redis)
await redis.zadd('leaderboard:global', { score: xpTotal, member: cybeingId });
const top100 = await redis.zrange('leaderboard:global', 0, 99, { rev: true });

// Rate limiting por wallet (sliding window)
const key = `ratelimit:${walletAddress}:${endpoint}`;
await redis.multi()
  .incr(key)
  .expire(key, 60)
  .exec();

// Pub/Sub para WebSocket (eventos entre instâncias da API)
await redis.publish('world:events', JSON.stringify({ type: 'island:updated', data }));
```

---

### 5.3 MongoDB via Atlas — Dados não-estruturados

**Porquê MongoDB aqui:**
- Histórico de conversas com Cybeings (schema variável por habilidade)
- Logs de IA (inputs/outputs para auditoria e melhoria)
- Eventos e lore do mundo (documentos ricos em JSON)
- Analytics comportamental

```javascript
// Collection: cybeing_chats
{
  _id: ObjectId,
  cybeingId: "cuid_abc",
  userId: "cuid_xyz",
  sessionId: "uuid",
  messages: [
    { role: "user", content: "...", timestamp: ISODate },
    { role: "assistant", content: "...", timestamp: ISODate, tokens: 142 }
  ],
  abilityType: "WRITING",
  totalTokens: 1847,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: world_events
{
  _id: ObjectId,
  type: "STORM",
  title: "A Grande Tempestade de Junho",
  affectedIslands: ["id1", "id2"],
  description: "...",
  effects: { xpMultiplier: 2.0, duration: 86400 },
  startedAt: ISODate,
  endsAt: ISODate
}

// Collection: ai_logs (auditoria)
{
  _id: ObjectId,
  cybeingId: "cuid_abc",
  type: "TOURNAMENT_OUTPUT",
  prompt: "...",
  response: "...",
  model: "gpt-4o",
  tokens: { prompt: 200, completion: 350 },
  latencyMs: 1240,
  cost: 0.0042,
  timestamp: ISODate
}
```

---

## 6. Blockchain & Smart Contracts

### Rede: Ethereum (EVM) via Alchemy

**Porquê Alchemy:**
- RPC node gerido com 99.9% uptime garantido
- Webhooks para eventos on-chain (mint, transfer, etc.)
- NFT API para ler metadados sem query directa à chain
- SDK TypeScript completo
- Free tier generoso (300M compute units/mês)

### Smart Contracts

```
packages/contracts/
├── contracts/
│   ├── CybeigsIsland.sol      # ERC-721 — Tokens de Ilha
│   ├── CybeigsFlag.sol        # ERC-721 — Tokens de Bandeira
│   ├── CybeigsNFT.sol         # ERC-721 — Tokens de Cybeing
│   └── CybeigsMarket.sol      # Marketplace on-chain
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── test/
└── hardhat.config.ts
```

**CybeigsIsland.sol — Ilha como NFT:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CybeigsIsland is ERC721, Ownable {
    struct Island {
        uint8 sizeType;       // 0=Small, 1=Medium, 2=Large
        int256 coordX;
        int256 coordY;
        uint256 purchasePrice;
        string metadataUri;   // IPFS URI com shape e imagens
    }

    mapping(uint256 => Island) public islands;
    mapping(bytes32 => bool) public coordsTaken;

    uint256 public nextTokenId = 1;

    // Preços em USDC (6 decimais)
    uint256 public constant PRICE_SMALL  = 50 * 10**6;   // $50 USDC
    uint256 public constant PRICE_MEDIUM = 150 * 10**6;  // $150 USDC
    uint256 public constant PRICE_LARGE  = 400 * 10**6;  // $400 USDC

    event IslandMinted(uint256 indexed tokenId, address owner, uint8 size, int256 x, int256 y);

    function mint(uint8 _size, int256 _x, int256 _y, string memory _uri)
        external payable returns (uint256)
    {
        bytes32 coordHash = keccak256(abi.encodePacked(_x, _y));
        require(!coordsTaken[coordHash], "Coordinates taken");

        uint256 price = _size == 0 ? PRICE_SMALL : _size == 1 ? PRICE_MEDIUM : PRICE_LARGE;
        // payment logic with USDC transfer...

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        islands[tokenId] = Island(_size, _x, _y, price, _uri);
        coordsTaken[coordHash] = true;

        emit IslandMinted(tokenId, msg.sender, _size, _x, _y);
        return tokenId;
    }
}
```

**CybeigsMarket.sol — Marketplace:**
```solidity
contract CybeigsMarket {
    uint256 public platformFeeBps = 500; // 5%

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 priceUsdc;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    function list(address _nft, uint256 _tokenId, uint256 _price) external { ... }
    function buy(uint256 _listingId) external { ... }
    function cancel(uint256 _listingId) external { ... }
}
```

### Integração SIWE (Sign-In With Ethereum)

```typescript
// Backend: verificar assinatura e emitir JWT
import { SiweMessage } from 'siwe';

async function verifySiwe(message: string, signature: string) {
  const siweMessage = new SiweMessage(message);
  const result = await siweMessage.verify({ signature });

  if (!result.success) throw new Error('Invalid signature');

  const user = await upsertUser(result.data.address);
  const jwt = signJwt({ userId: user.id, walletAddress: user.walletAddress });

  return { user, jwt };
}
```

### Wallets suportadas

```typescript
// Frontend: config wagmi + RainbowKit
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, base } from 'wagmi/chains';
import { metaMaskWallet, coinbaseWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';

export const wagmiConfig = getDefaultConfig({
  appName: 'Cybeings',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [mainnet, base],
  wallets: [
    { groupName: 'Popular', wallets: [metaMaskWallet, coinbaseWallet] },
    { groupName: 'Mais wallets', wallets: [walletConnectWallet] },
  ],
});
```

---

## 7. IA & Geração de Cybeings

### Arquitectura de IA

```
Pedido de mint
     │
     ▼
┌────────────────────────────────────────────────┐
│  GERAÇÃO ASSÍNCRONA (BullMQ Worker)            │
│                                                │
│  1. Gerar habilidade aleatória ponderada       │
│  2. Gerar personalidade (GPT-4o)               │
│  3. Gerar aparência (prompt → Replicate/SDXL)  │
│  4. Gerar nome e lore (GPT-4o)                 │
│  5. Calcular raridade                          │
│  6. Upload imagem → IPFS                       │
│  7. Mintar NFT on-chain                        │
│  8. Guardar no PostgreSQL                      │
│  9. Notificar utilizador via WebSocket         │
└────────────────────────────────────────────────┘
```

**Geração de habilidade:**
```typescript
const ABILITY_WEIGHTS = {
  WRITING:           15,
  CODE:              12,
  ANALYSIS:          12,
  TRANSLATION:       10,
  SUMMARIZATION:     10,
  TUTORING:           9,
  STORYTELLING:       8,
  DEBATE:             7,
  COACHING:           7,
  MATH:               5,
  IMAGE_DESCRIPTION:  3,
  MUSIC_DESCRIPTION:  2, // Mais raro
};

function pickAbility(seed: number): AbilityType {
  // Weighted random usando o seed do Cybeing
  // Garante reprodutibilidade — mesmo seed, mesma habilidade
}
```

**Geração de personalidade (GPT-4o):**
```typescript
const personalityPrompt = `
Gera a personalidade de um ser digital chamado Cybeing.
Habilidade principal: ${abilityType}
Seed: ${seed}

Responde APENAS em JSON:
{
  "name": "Nome único e criativo",
  "personality_traits": ["traço1", "traço2", "traço3"],
  "speech_style": "Descrição do estilo de fala",
  "lore": "História de origem em 2-3 frases",
  "catchphrase": "Frase característica"
}
`;
```

**Geração de imagem (Stable Diffusion XL via Replicate):**
```typescript
const imagePrompt = buildImagePrompt(abilityType, traits, seed);
// Ex: "digital creature, glowing circuitry patterns, blue energy aura,
//      analytical eyes, floating data streams, cyberpunk aesthetic,
//      transparent wings made of code, seed:42837"

const output = await replicate.run("stability-ai/sdxl", {
  input: {
    prompt: imagePrompt,
    negative_prompt: "human, realistic, dark, scary, weapon",
    seed: seed,
    width: 512,
    height: 512,
    num_inference_steps: 30,
  }
});
```

**Interacção com Cybeing (runtime):**
```typescript
// Cada Cybeing tem um system prompt único baseado na sua personalidade
const systemPrompt = `
És ${cybeing.name}, um ser digital com a habilidade de ${cybeing.abilityName}.
Personalidade: ${cybeing.personalityTraits.join(', ')}.
Estilo de fala: ${cybeing.speechStyle}.
Lore: ${cybeing.lore}.

Responde sempre em personagem. Usa a tua habilidade de ${cybeing.abilityName}
para ajudar o utilizador. Nunca quebres o personagem.
Nível actual: ${cybeing.level}. XP: ${cybeing.xp}.
`;

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ],
  max_tokens: 1000,
});
```

---

## 8. Armazenamento de Ficheiros

### IPFS via Pinata — Imagens permanentes (NFT metadata)

Tudo o que é associado a um NFT vai para IPFS — imagens de Cybeings, bandeiras, e metadata JSON. IPFS garante que os ficheiros são imutáveis e permanentes — não dependem dos servidores da Cybeings para existir.

```typescript
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });

// Upload de imagem
async function uploadToIPFS(imageBuffer: Buffer, filename: string) {
  const file = new File([imageBuffer], filename, { type: 'image/png' });
  const result = await pinata.upload.file(file);
  return {
    cid: result.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  };
}

// Upload de metadata NFT
async function uploadNFTMetadata(cybeing: CybeingData) {
  const metadata = {
    name: cybeing.name,
    description: cybeing.lore,
    image: `ipfs://${cybeing.imageCid}`,
    attributes: [
      { trait_type: "Ability", value: cybeing.abilityType },
      { trait_type: "Rarity", value: cybeing.rarityTier },
      { trait_type: "Level", value: cybeing.level },
    ]
  };
  const result = await pinata.upload.json(metadata);
  return `ipfs://${result.IpfsHash}`;
}
```

### Cloudinary — Imagens de UI (capas de ilhas)

As fotos de capa das ilhas não são NFTs — são imagens de UI que precisam de transformações (crop, resize, compressão). Cloudinary é ideal para isso.

```typescript
import { v2 as cloudinary } from 'cloudinary';

// Upload de capa da ilha com transformação automática
async function uploadIslandCover(file: File, islandId: string) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `islands/${islandId}`,
    transformation: [
      { width: 1200, height: 600, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    // Moderação automática de conteúdo
    moderation: 'aws_rek',
  });
  return result.secure_url;
}

// Validação de bandeira (370x370px exactos)
async function uploadFlag(file: File, islandId: string) {
  // Rejeita se não for 370x370
  const metadata = await getImageMetadata(file);
  if (metadata.width !== 370 || metadata.height !== 370) {
    throw new Error('A bandeira deve ser exactamente 370×370px');
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: `flags/${islandId}`,
    // Sem transformação — mantém dimensões exactas
  });
  return result.secure_url;
}
```

---

## 9. Infraestrutura Cloud

### Diagrama de serviços e custos

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUÇÃO                              │
│                                                         │
│  Vercel (Frontend)           Railway (Backend API)       │
│  ├─ Next.js SSR/SSG          ├─ Node.js + Fastify        │
│  ├─ Edge Network global      ├─ Auto-scaling              │
│  └─ Preview deployments      └─ WebSocket support         │
│                                                         │
│  Supabase (PostgreSQL)       Upstash (Redis)            │
│  ├─ Managed PostgreSQL       ├─ Serverless Redis          │
│  ├─ Auto backups             ├─ Global edge nodes         │
│  └─ Row Level Security       └─ Pay-per-request           │
│                                                         │
│  MongoDB Atlas               Cloudflare                 │
│  ├─ M10+ cluster             ├─ CDN + DDoS protection    │
│  ├─ Global replication       ├─ WAF                       │
│  └─ Automated backups        └─ SSL termination           │
│                                                         │
│  Alchemy (Blockchain RPC)    Pinata (IPFS)              │
│  ├─ Ethereum mainnet         ├─ NFT storage               │
│  ├─ Webhook events           └─ Dedicated gateway         │
│  └─ NFT API                                             │
│                                                         │
│  Cloudinary (Media)          Replicate (AI Images)      │
│  ├─ Island covers            ├─ SDXL image generation    │
│  ├─ Auto moderation          └─ Pay-per-generation        │
│  └─ CDN delivery                                        │
│                                                         │
│  OpenAI (GPT-4o)             Resend (Email)             │
│  ├─ Cybeing personalities    ├─ Transactional emails      │
│  ├─ Tournament evaluation    └─ Notifications             │
│  └─ Chat runtime                                        │
└─────────────────────────────────────────────────────────┘
```

### Configuração de ambientes

| Ambiente | Propósito | Config |
|----------|-----------|--------|
| `development` | Local / Codespaces | Docker Compose local, testnets blockchain |
| `staging` | Preview por PR | Vercel Preview + Railway staging env |
| `production` | Utilizadores reais | Configuração completa descrita acima |

### Variáveis de ambiente críticas

```bash
# Base de dados
DATABASE_URL=postgresql://...supabase.co/postgres
REDIS_URL=rediss://...upstash.io:6380
MONGODB_URI=mongodb+srv://...mongodb.net/cybeings

# Auth
JWT_SECRET=...
NEXTAUTH_SECRET=...

# Blockchain
ALCHEMY_API_KEY=...
ALCHEMY_WEBHOOK_SECRET=...
CONTRACT_ISLAND_ADDRESS=0x...
CONTRACT_CYBEING_ADDRESS=0x...
CONTRACT_MARKET_ADDRESS=0x...

# IA
OPENAI_API_KEY=...
REPLICATE_API_TOKEN=...

# Storage
PINATA_JWT=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend
NEXT_PUBLIC_WC_PROJECT_ID=...   # WalletConnect
NEXT_PUBLIC_ALCHEMY_KEY=...
NEXT_PUBLIC_CHAIN_ID=1          # 1=mainnet, 11155111=sepolia

# Email
RESEND_API_KEY=...
```

---

## 10. Segurança

### Autenticação e autorização

```typescript
// Middleware de autenticação em cada request protegido
async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return reply.status(401).send({ error: 'Unauthorized' });

  try {
    const payload = verifyJwt(token);
    request.user = await getUserById(payload.userId);
  } catch {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

// Verificação de propriedade (nunca confiar no body)
async function assertIslandOwner(islandId: string, userId: string) {
  const island = await prisma.island.findUnique({ where: { id: islandId } });
  if (!island || island.ownerId !== userId) {
    throw new ForbiddenError('Not your island');
  }
  return island;
}
```

### Rate limiting por wallet

```typescript
const rateLimits = {
  'POST /cybeings/mint':      { max: 5,   window: '1h' },
  'POST /tournaments/enter':  { max: 20,  window: '1h' },
  'POST /cybeings/:id/chat':  { max: 100, window: '1h' },
  'POST /islands':            { max: 3,   window: '24h' },
};
```

### Validação de uploads

```typescript
// Validação server-side de bandeira (nunca confiar no cliente)
async function validateFlagUpload(buffer: Buffer): Promise<void> {
  const sharp = require('sharp');
  const metadata = await sharp(buffer).metadata();

  if (metadata.width !== 370 || metadata.height !== 370) {
    throw new ValidationError('Flag must be exactly 370×370px');
  }
  if (!['png'].includes(metadata.format ?? '')) {
    throw new ValidationError('Flag must be PNG format');
  }
  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new ValidationError('Flag must be under 2MB');
  }
}
```

### Verificação de transacções blockchain

```typescript
// Nunca creditar antes de confirmar on-chain
async function confirmTransaction(txHash: string, expectedFrom: string) {
  const alchemy = new Alchemy({ apiKey: process.env.ALCHEMY_API_KEY });

  // Aguardar 2 confirmações de bloco
  const receipt = await alchemy.core.waitForTransaction(txHash, 2);

  if (!receipt || receipt.status !== 1) {
    throw new Error('Transaction failed or reverted');
  }
  if (receipt.from.toLowerCase() !== expectedFrom.toLowerCase()) {
    throw new Error('Transaction sender mismatch');
  }

  return receipt;
}
```

### Content Security Policy (via Cloudflare + Next.js headers)

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "img-src 'self' data: blob: *.cloudinary.com *.pinata.cloud ipfs.io",
      "connect-src 'self' wss: *.alchemy.com *.supabase.co",
    ].join('; ')
  }
];
```

---

## 11. CI/CD Pipeline

### GitHub Actions — Fluxo completo

```
Push para branch feature
         │
         ▼
┌────────────────────────┐
│  PR Checks             │
│  ├─ Lint (ESLint)      │
│  ├─ Type check (tsc)   │
│  ├─ Unit tests (Vitest)│
│  ├─ Contract tests     │
│  └─ Build check        │
└──────────┬─────────────┘
           │ PR aprovado + merge para main
           ▼
┌────────────────────────┐
│  Staging Deploy        │
│  ├─ Build Next.js      │
│  ├─ Deploy → Vercel    │
│  ├─ Deploy API →       │
│  │   Railway staging   │
│  └─ DB migrations      │
└──────────┬─────────────┘
           │ Aprovação manual
           ▼
┌────────────────────────┐
│  Production Deploy     │
│  ├─ Build & test       │
│  ├─ Deploy → Vercel    │
│  ├─ Deploy API →       │
│  │   Railway prod      │
│  ├─ DB migrations      │
│  └─ Smoke tests        │
└────────────────────────┘
```

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy-staging:
    needs: check
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy API to Railway (staging)
        run: railway up --service api --environment staging
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      # Vercel faz preview deploy automático em PRs

  deploy-production:
    needs: check
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Run DB migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - name: Deploy API to Railway (production)
        run: railway up --service api --environment production
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      # Vercel faz production deploy automático em push para main
```

### Protecção de branches

```
main branch:
  ├─ Require PR review (mínimo 1 aprovação)
  ├─ Require status checks passing
  ├─ No force push
  └─ No delete

develop branch:
  └─ Merge livre para developers
```

---

## 12. Monitorização & Observabilidade

### Stack de observabilidade

| Componente | Ferramenta | Propósito |
|-----------|------------|-----------|
| Logs centralizados | Axiom | Todos os logs da API e workers |
| Métricas | Railway built-in + Vercel Analytics | CPU, RAM, latência, Web Vitals |
| Erros frontend | Sentry | Stack traces, session replay |
| Erros backend | Sentry | Exceptions, performance traces |
| Uptime | Better Uptime | Alertas de downtime por email/SMS |
| Blockchain | Alchemy Notify | Alertas de eventos on-chain |

**Métricas críticas a monitorizar:**

```
Performance
├─ API latência p50/p95/p99 (target: p95 < 200ms)
├─ WebSocket conexões activas
├─ Mapa: FPS no cliente (target: >30fps)
└─ Tempo de geração de Cybeing (target: <60s)

Negócio
├─ Cybeings criados por dia
├─ Ilhas vendidas por dia
├─ Volume marketplace (USDC)
├─ Torneios completados
└─ Utilizadores activos (DAU/MAU)

Blockchain
├─ Transacções confirmadas vs falhadas
├─ Tempo médio de confirmação
└─ Gas fees médias

IA
├─ Custo por Cybeing gerado
├─ Tokens consumidos por chat
└─ Taxa de moderação de imagens rejeitadas
```

---

## 13. Fluxos Críticos do Sistema

### Fluxo: Compra de Ilha

```
Utilizador → Selecciona localização e tamanho no mapa
     │
     ▼
Frontend → Verifica se coordenadas estão livres (API)
     │
     ▼
Frontend → Abre modal de confirmação com preço em USDC
     │
     ▼
Wallet → Utilizador aprova transferência USDC
     │
     ▼
Smart Contract → Transfere USDC, minta Island NFT
     │
     ▼
Alchemy Webhook → Notifica backend da transacção confirmada
     │
     ▼
Backend → Cria registo no PostgreSQL, gera shape aleatório
     │
     ▼
WebSocket → Notifica todos os utilizadores que vêem aquela zona
     │
     ▼
Mapa → Nova ilha aparece em tempo real para toda a gente
```

### Fluxo: Mint de Cybeing

```
Utilizador → Clica "Criar Cybeing" (paga fee em USDC)
     │
     ▼
Backend → Coloca job na fila BullMQ (resposta imediata ao utilizador)
     │
     ▼
Worker → Gera habilidade por peso aleatório com seed único
     │
     ▼
Worker → GPT-4o gera personalidade, nome, lore (JSON)
     │
     ▼
Worker → Stable Diffusion XL gera imagem baseada em habilidade + personalidade
     │
     ▼
Worker → Upload imagem + metadata → IPFS via Pinata
     │
     ▼
Worker → Minta NFT on-chain com metadata URI IPFS
     │
     ▼
Worker → Guarda tudo no PostgreSQL
     │
     ▼
WebSocket → Notifica utilizador: "O teu Cybeing está pronto!"
```

### Fluxo: Torneio 1v1

```
Dono A desafia Dono B (ambos apostam USDC)
     │
     ▼
Smart Contract → Bloqueia apostas em escrow
     │
     ▼
Backend → Gera desafio baseado na habilidade comum dos Cybeings
     │
     ▼
Ambos os Cybeings → Recebem o mesmo prompt, executam simultaneamente
     │
     ▼
GPT-4o → Avalia outputs com critérios pré-definidos (score 0-100)
     │
     ▼
Comunidade → 24h para votar nos outputs (peso: 40%)
     │
     ▼
Backend → Calcula score final (60% IA + 40% votos)
     │
     ▼
Smart Contract → Liberta escrow, transfere prémio ao vencedor
     │
     ▼
Backend → Distribui XP, actualiza rankings, actualiza nível Cybeings
     │
     ▼
WebSocket → Notifica resultado a todos os seguidores do torneio
```

---

## 14. Estimativa de Custos Cloud

### Fase 1 — MVP / Beta (0-1.000 utilizadores)

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Vercel | Pro | $20 |
| Railway | Starter | $20 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-per-use | ~$10 |
| MongoDB Atlas | M10 | $57 |
| Cloudflare | Free | $0 |
| Alchemy | Growth | $49 |
| Pinata | Picnic | $20 |
| Cloudinary | Plus | $89 |
| OpenAI API | Pay-per-use | ~$100 |
| Replicate | Pay-per-use | ~$50 |
| Resend | Pro | $20 |
| **TOTAL** | | **~$460/mês** |

### Fase 2 — Crescimento (1.000-10.000 utilizadores)

| Serviço | Ajuste | Custo/mês |
|---------|--------|-----------|
| Vercel | Enterprise | $400 |
| Railway | Pro (múltiplas instâncias) | $100 |
| Supabase | Pro + add-ons | $100 |
| MongoDB Atlas | M30 | $200 |
| OpenAI + Replicate | Volume maior | ~$500 |
| Outros (escalam proporcionalmente) | | ~$300 |
| **TOTAL** | | **~$1.600/mês** |

---

## 15. Roadmap Técnico por Fase

### Fase 0 — Fundações (Meses 1-2)
- [ ] Setup monorepo GitHub + Codespaces
- [ ] Schema PostgreSQL completo com Prisma
- [ ] Autenticação SIWE com MetaMask e Coinbase Wallet
- [ ] Deploy básico Vercel + Railway
- [ ] Smart contracts em testnet (Sepolia)

### Fase 1 — Core MVP (Meses 3-4)
- [ ] Mapa mundial com Canvas/WebGL
- [ ] Compra de ilhas (testnet)
- [ ] Upload de capa e bandeira (370×370px)
- [ ] Mint de Cybeings com geração de IA
- [ ] Chat básico com Cybeing

### Fase 2 — Economia (Meses 5-6)
- [ ] Marketplace de compra e venda
- [ ] Sistema de aluguer
- [ ] Torneios 1v1 com escrow
- [ ] XP e sistema de níveis
- [ ] Deploy em mainnet Ethereum

### Fase 3 — Comunidade (Meses 7-9)
- [ ] Guilds e arquipélagos
- [ ] Torneios semanais e mensais
- [ ] Sistema de votação da comunidade
- [ ] Eventos globais do mundo
- [ ] Leaderboards globais

### Fase 4 — Escala (Meses 10-12)
- [ ] Performance optimizations (WebGL avançado)
- [ ] Mobile PWA
- [ ] Preparação para token $CBEINGS
- [ ] API pública para developers
- [ ] Integração Telegram Mini App

---

*Documento gerado em Junho 2026. Versão 1.0.*
*Arquitectura desenhada para escalar de 0 a 100.000 utilizadores sem mudanças estruturais.*
