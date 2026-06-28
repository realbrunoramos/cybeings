# Cybeings

Web3 + AI platform where owners mint unique AI-powered digital beings — Cybeings —
that live on an infinite interactive world map, evolve through use, and generate
value through rental, marketplace, tournaments, and breeding.

## Monorepo structure

| Path | Description |
|------|-------------|
| apps/web | Next.js 14 frontend (Vercel) |
| apps/api | Fastify backend (Railway) |
| packages/contracts | Solidity smart contracts (Hardhat) |
| packages/shared | Shared TypeScript types |
| packages/ui | Shared React design system |
| docs | Architecture and session state |

## Getting started

    pnpm install
    pnpm dev

See CLAUDE.md for conventions and docs/SESSION_STATE.md for current project state.

## Stack

Next.js, Fastify, PostgreSQL (Supabase), Redis (Upstash), MongoDB (Atlas),
Ethereum (Alchemy), wagmi + RainbowKit, OpenAI GPT-4o, Replicate SDXL,
IPFS (Pinata), Cloudinary.