# Cybeings — Session State

Last updated: June 2026 — Session #2

Session #: 2

Current phase: Phase 0 — Foundations

---

## Current State

The repository is live and private at github.com/realbrunoramos/cybeings. The monorepo skeleton is in place: pnpm workspaces configured, five workspace packages scaffolded (web, api, contracts, shared, ui), base config files created, and the environment template defined. No application code or framework setup yet — those come in the next Phase 0 tasks.

---

## What Was Done (last 3 sessions)

### Session #2 — June 2026

- Created private GitHub repository cybeings

- Scaffolded monorepo structure with pnpm workspaces (apps/* + packages/*)

- Added root config: package.json, pnpm-workspace.yaml, tsconfig.base.json, .prettierrc, .gitignore

- Created .env.example with all required service variables

- Added CLAUDE.md and this SESSION_STATE.md to docs

### Session #1 — June 2026

- Full product concept defined for Cybeings

- Complete technical architecture documented

- Stack decided: Next.js + Fastify + Supabase + Upstash + Atlas + Alchemy + wagmi/RainbowKit

- Brand book created (Bioluminescent Dark identity)

- Key decisions: USDC default currency, flag is user-submitted 370x370px PNG, no biomes, $CBEINGS deferred to Phase 4

---

## In Progress

Task: F0-T1 — Repository and base structure (completing)

Files modified: root config files, workspace package.json stubs, docs

State: Skeleton committed. Next: add full architecture.md to docs, then move to F0-T2 (devcontainer).

Active branch: main (bootstrap commit only; feature branches from here on)

Exact next step: Add docs/architecture.md, then configure .devcontainer/devcontainer.json for GitHub Codespaces.

---

## Next Steps (ordered by priority)

1. Add docs/architecture.md (full technical reference) to the repo

2. F0-T2 — Configure .devcontainer/devcontainer.json for GitHub Codespaces

3. F0-T3 — Set up Next.js 14 in apps/web (App Router, Tailwind, Cybeings palette + fonts)

4. F0-T4 — Set up Fastify in apps/api (health check, module structure)

---

## Technical Decisions Log (permanent)

| Date | Decision | Justification |

|------|----------|---------------|

| Jun 2026 | Repository is private | Develop privately until Phase 1 MVP is presentable |

| Jun 2026 | Initial scaffold committed directly to main | Bootstrap exception; feature branches used from now on |

| Jun 2026 | Stack locked: Next.js 14 + Fastify + Supabase + Upstash + Atlas | Performance, ecosystem, cost, DX |

| Jun 2026 | Flag: 370x370px PNG, user-submitted, separate NFT | Unique identity, never AI-generated |

| Jun 2026 | Default currency: USDC | Price stability for stakes and transactions |

| Jun 2026 | $CBEINGS token: Phase 4 only | Reduce initial complexity |

---

## Known Issues / Blockers

- None yet — project bootstrapping.

---

## Environment Configuration

Repository: github.com/realbrunoramos/cybeings (private)

Main branch: main

Current working branch: main

Frontend deploy: not configured yet (Vercel)

Backend deploy: not configured yet (Railway)

Active chain: Sepolia testnet (chain ID 11155111; switch to mainnet in Phase 2)

Deployed contracts:

  - Island: not deployed yet

  - Flag: not deployed yet

  - Cybeing: not deployed yet

  - Market: not deployed yet
