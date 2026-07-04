# Cybeings — Estado da Sessão

**Última atualização:** 4 Julho 2026
**Sessão #:** 5
**Fase atual:** Fase 0 — Fundações (a fechar; falta só F0-T8)

---

## Estado Geral

Backend do Cybeings AO VIVO na internet. Todas as camadas de infraestrutura em produção: frontend Vercel, backend Fastify no Railway (URL público `https://cybeingsapi-production.up.railway.app`), Postgres (Supabase), Redis (Upstash), MongoDB (Atlas). Health check público responde 200 com os três checks OK. F0-T1, T3, T4, T5, T6, T7, T9 e T10 concluídas. Falta apenas F0-T8 (smart contracts em Sepolia) para fechar 100% a Fase 0.

---

## O que foi feito (histórico das últimas sessões)

### Sessão #5 — 4 Julho 2026

**F0-T10 parte 2 — Backend em produção no Railway (CONCLUÍDA):**
- Conta Railway criada via GitHub (plano trial $5)
- Projeto `adorable-surprise` importado do repositório
- Serviço `@cybeings/web` removido (frontend já está em Vercel; ficaria duplicado)
- Serviço `@cybeings/api` configurado manualmente porque o Nixpacks ignorou o railway.json:
  - Build Command: `pnpm install --frozen-lockfile && pnpm --filter @cybeings/api exec prisma generate && pnpm --filter @cybeings/api build`
  - Start Command: `pnpm --filter @cybeings/api start:prod`
  - Healthcheck Path: `/health`
- 5 variáveis de ambiente colocadas via Raw Editor (DATABASE_URL, DIRECT_URL, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, MONGODB_URI)
- URL público gerado: `https://cybeingsapi-production.up.railway.app`
- Prova ponta-a-ponta pública: `curl https://cybeingsapi-production.up.railway.app/health` → 200 com `checks: {database:"ok", redis:"ok", mongo:"ok"}`

**Percalços resolvidos durante esta sessão:**
- CI vermelho no commit 6b9a916: causa raiz = `prisma generate` não corria no CI porque o `--frozen-lockfile` ignora scripts. Resolvido em `03c6d98` adicionando step `pnpm --filter @cybeings/api exec prisma generate` nos 3 jobs do CI. Verificado empiricamente com `--ignore-scripts` local antes de commitar.
- Mesmo problema no railway.json (buildCommand não gerava Prisma Client) → resolvido em `d838fd1` adicionando `exec prisma generate` no meio da cadeia.
- Cache do Next.js local corrompido (erro "Cannot find module './404.js'" em localhost:3000) → resolvido apagando `apps/web/.next` e reinstalando dependências. Sem impacto no repositório.
- Working tree pendente da sessão anterior (`apps/web/tsconfig.json` + `next-env.d.ts`) resolvido em `539b6fc` no início da sessão, com criação do `apps/web/.gitignore` correto (Next.js standard).
- CVE HIGH no `next@14.2.15` bloqueou o build no Railway (security scanner detetou CVE-2025-55184 e CVE-2025-67779). Resolvido em `1148de7` atualizando para next@14.2.35. Localmente 3 builds passaram (web, api, monorepo type-check).
- Railway ignorou o commit do CVE (SKIPPED) porque o watch pattern era só `/apps/api/**`. Resolvido adicionando `/pnpm-lock.yaml` aos watch paths via botão "Add lockfile watch pattern" do próprio Railway.

**Commits desta sessão:**
- `539b6fc` — chore(web): add .gitignore, accept Next.js tsconfig auto-updates
- `89ab96f` — (limpeza, prévio a F0-T6 completa) - já registado na sessão #4 mas commit-hash confirmado
- `03c6d98` — ci: run prisma generate before lint/type-check/build
- `d838fd1` — fix(railway): run prisma generate in build command
- `1148de7` — chore(deps): bump next to 14.2.35 to fix CVE-2025-55184 and CVE-2025-67779

### Sessão #4 — 3 Julho 2026
- F0-T6 (Upstash Redis) concluída — commit `89ab96f`
- F0-T7 (MongoDB Atlas) concluída, 3 coleções + índices + TTL 90 dias em ai_logs — commit `2fac6c3`
- F0-T9 (CI/CD GitHub Actions) inicial — commit `b5cf871`
- F0-T10 parte 1 (preparação Railway: railway.json, start:prod, .nvmrc, HOST 0.0.0.0) — commit `6b9a916`

### Sessão #3 — 2 Julho 2026
- F0-T4 (Fastify) e F0-T5 (Supabase + Prisma v6 + 10 modelos + migração + health check DB)
- Migração para Claude Code local com SSH permanente
- docs/architecture.md e docs/PROJECT_INSTRUCTIONS.md v2 adicionados

### Sessão #2 — 28 Junho 2026
- Repositório privado `realbrunoramos/cybeings` criado
- F0-T1 (monorepo pnpm) e F0-T3 (frontend Next.js 14 + identidade visual)
- Deploy frontend na Vercel

### Sessão #1 — Junho 2026
- Definição do produto Cybeings, arquitetura, stack

---

## Em Curso

**Tarefa:** Nada a meio. Sessão fechada em ponto limpo com o backend em produção.
**Branch ativa:** main
**Working tree:** limpo.

---

## Próximos Passos (por prioridade)

1. **F0-T8 — Smart contracts em Sepolia testnet** (única tarefa da Fase 0 pendente):
   - Requer criar conta Alchemy (alchemy.com)
   - Requer wallet Ethereum de teste (MetaMask)
   - Requer obter ETH de teste da faucet Sepolia
   - Escrever e testar 4 contratos: CybeigsIsland, CybeigsFlag, CybeigsNFT, CybeigsMarket
   - Deploy em Sepolia, verificar no Etherscan
   - Guardar endereços dos contratos aqui
   - Tempo estimado: várias horas — sessão dedicada
2. Fechar oficialmente a Fase 0 e passar à Fase 1 (F1-T1 — Autenticação SIWE)
3. Considerar (opcional): adicionar ESLint real ao apps/api para substituir o `tsc --noEmit` como proxy de lint (TODO registado no CLAUDE.md)

---

## Decisões Técnicas Tomadas (permanente)

| Data | Decisão | Justificação |
|------|---------|--------------|
| Jun 2026 | Stack: Next.js 14 + Fastify + Supabase + Upstash + Atlas | Performance, ecossistema, custo, DX |
| Jun 2026 | Blockchain: Ethereum EVM via Alchemy | Credibilidade, ecossistema NFT, MetaMask nativo |
| Jun 2026 | Wallets: MetaMask + Coinbase + WalletConnect | Cobertura máxima de utilizadores |
| Jun 2026 | Auth: SIWE (Sign-In With Ethereum) | Padrão da indústria, sem passwords |
| Jun 2026 | Bandeira: PNG 370×370px obrigatório, token NFT | Identidade única, não gerada |
| Jun 2026 | Biomas: eliminados — foto de capa submetida pelo dono | Mais autêntico, infinitamente variável |
| Jun 2026 | Token $CBEINGS: Fase 4 | Reduz complexidade inicial, cresce com a comunidade |
| Jun 2026 | Moeda padrão: USDC | Estabilidade, sem volatilidade para apostas |
| Jun 2026 | Geração de imagens: SDXL via Replicate | Pay-per-use, qualidade, API simples |
| Jun 2026 | Storage NFT: IPFS via Pinata | Descentralizado, permanente, padrão da indústria |
| Jun 2026 | Storage UI: Cloudinary | Transformações automáticas, moderação, CDN |
| Jun 2026 | Tailwind v3.4 + tokens em CSS variables | Estável, previsível, fiel ao brandbook |
| Jun 2026 | Next.js 14.2 + React 18 (App Router) | Versões estáveis, bem suportadas pela Vercel |
| Jun 2026 | Deploy frontend: Vercel, Root Directory = apps/web | Monorepo: Vercel precisa do path da app |
| Jul 2026 | Ferramenta de execução: Claude Code local | Compila, testa e faz push antes de commitar |
| Jul 2026 | Autenticação Git: SSH (chave cybeings-sshkey) | Push automático a partir do Claude Code |
| Jul 2026 | Prisma pinado em v6 | v7 tem incompatibilidades abertas com Supabase |
| Jul 2026 | Fastify + fastify-plugin para app.prisma/app.redis/app.mongo | Padrão do ecossistema Fastify |
| Jul 2026 | Rate limit temporário por IP até SIWE (TODO F1-T1) | Fallback aceite até auth existir |
| Jul 2026 | Branches: main direto na Fase 0; PRs a partir da Fase 1 | Projeto solo em fundações |
| Jul 2026 | Cliente Upstash: `@upstash/redis` (REST) em vez de `ioredis` | Serverless-friendly, sem gestão de sockets |
| Jul 2026 | Carregamento de .env: flag nativa `--env-file=.env` do Node 20.6+ em dev | Sem dependência de dotenv |
| Jul 2026 | Health check: comparar `String(stored) === value` para o Redis | Upstash faz auto-parse JSON e devolve number |
| Jul 2026 | Deploy backend: Railway (não Fly.io nem Render) | railway.json já configurado; trial $5 chega para meses de dev |
| Jul 2026 | Backend produção start via `start:prod` (sem --env-file) | Railway injeta variáveis diretamente em process.env |
| Jul 2026 | Railway: config manual em Settings (build/start/healthcheck) | Nixpacks ignorou o railway.json da raiz do monorepo |
| Jul 2026 | Railway watch paths: `/apps/api/**` + `/pnpm-lock.yaml` | Sem o lockfile, updates de dependências no root não disparavam redeploy |
| Jul 2026 | CI corre `prisma generate` como step explícito nos 3 jobs | `--frozen-lockfile` ignora scripts; postinstall do Prisma não corre |
| Jul 2026 | Next.js pinado em 14.2.35 (patch, não major) | Fix de CVEs HIGH; convenção conservadora (versão exata) |

---

## Problemas Conhecidos / Blockers

- Nenhum bloqueador ativo.
- Nota: URL de produção Vercel pode pedir login a terceiros por o repositório ser privado (Deployment Protection). Normal.
- Nota operacional (macOS): `pnpm` em `/opt/homebrew/bin` — pode precisar de `export PATH="/opt/homebrew/bin:$PATH"` em sessões futuras.
- TODO menor: adicionar ESLint real ao apps/api (atualmente usa `tsc --noEmit` como proxy de lint).

---

## Configuração do Ambiente

**Repositório:** github.com/realbrunoramos/cybeings (privado)
**Branch principal:** main
**Branch de trabalho atual:** main
**Git:** SSH (chave cybeings-sshkey); remote `git@github.com:realbrunoramos/cybeings.git`
**Ferramenta de execução:** Claude Code local (macOS)
**Frontend em produção:** Vercel — https://cybeings-*.vercel.app (root directory `apps/web`, redeploy automático em push para main)
**Backend em produção:** Railway — https://cybeingsapi-production.up.railway.app (região EU West, 1 replica; healthcheck `/health` OK)
**Base de dados relacional:** Supabase — schema com 10 tabelas migrado
**Cache/pub-sub:** Upstash Redis — cliente REST integrado
**Base de dados não estruturada:** MongoDB Atlas — 3 coleções + índices + TTL 90 dias em ai_logs
**Chain ativa:** Sepolia testnet (mudar para mainnet na Fase 2)
**Contratos deployed:**
- Island: não deployed ainda (F0-T8)
- Cybeing: não deployed ainda (F0-T8)
- Flag: não deployed ainda (F0-T8)
- Market: não deployed ainda (F0-T8)

---

## Credenciais e Acessos (referências, nunca valores reais)

- Variáveis de ambiente: ver `.env.example` no repo + `apps/api/.env` local (gitignored) + 5 vars no Railway
- GitHub: realbrunoramos (SSH `cybeings-sshkey`)
- Vercel: ligada via GitHub — projeto cybeings AO VIVO
- Railway: ligada via GitHub — projeto `adorable-surprise` — serviço `@cybeings/api` AO VIVO
- Supabase: conta criada, projeto cybeings ativo
- Upstash: conta criada, base Redis `cybeings` ativa
- MongoDB Atlas: conta criada, cluster `cybeings` ativo (M0, allowlist 0.0.0.0/0)
- Alchemy: a criar em alchemy.com (para F0-T8)
- Pinata: a criar em pinata.cloud (Fase 1)
- Cloudinary: a criar em cloudinary.com (Fase 1)
- Resend: a criar em resend.com (Fase 1)
