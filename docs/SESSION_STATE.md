# Cybeings — Estado da Sessão

Última actualização: 28 Junho 2026

Sessão #: 2

Fase actual: Fase 0 — Fundações

---

## Estado Geral

Fundação técnica em marcha. O repositório existe, o monorepo está montado, e o
frontend (landing page com a identidade visual completa) está EM PRODUÇÃO na
Vercel, com deploy automático a cada push para main. F0-T1 (estrutura) e F0-T3
(frontend) concluídas. Ainda não há backend, base de dados, nem smart contracts.

---

## O que foi feito (histórico das últimas sessões)

### Sessão #2 — 28 Junho 2026

- Repositório realbrunoramos/cybeings criado (privado)

- F0-T1 concluída: monorepo pnpm (apps/web, apps/api, packages/shared, packages/ui, packages/contracts)

- Ficheiros de raiz: package.json, pnpm-workspace.yaml, .npmrc, .nvmrc, .gitignore, tsconfig.base.json, .env.example, README.md, CLAUDE.md

- F0-T3 concluída: frontend Next.js 14 + Tailwind com tokens Cybeings, fontes Syne/Space Grotesk/Space Mono, landing page (hero + 4 pilares + footer)

- Deploy do frontend na Vercel (parte de F0-T10 adiantada): Root Directory = apps/web

- Relatório de auditoria gerado em docs/PROGRESS_REPORT.md

- Validado: extensão do Chrome consegue ler/criar/substituir ficheiros e commitar em main

- Validado: deploy automático Vercel ligado ao GitHub (push em main → republica)

### Sessão #1 — Junho 2026

- Definição completa do conceito de produto Cybeings

- Arquitectura técnica completa documentada em /docs/architecture.md

- Stack decidida e ficheiros master criados

---

## Em Curso

Tarefa: Nada a meio — sessão fechada num ponto limpo após guardar progresso.

Ficheiros modificados: todos commitados.

Estado: F0-T1 e F0-T3 concluídas; frontend ao vivo.

Branch activa: main

Próximo passo concreto: F0-T4 — setup do backend Fastify (health check + estrutura de módulos), OU continuar a enriquecer o frontend. Decisão do fundador.

---

## Próximos Passos (ordenados por prioridade)

1. F0-T4 — Setup Fastify API (TypeScript strict, GET /health, módulos auth/island/cybeing/tournament/marketplace, CORS + rate limiting + logging)

2. F0-T2 — GitHub Codespaces (.devcontainer com Node 20, pnpm, port forwarding 3000/4000)

3. F0-T5 — Supabase/PostgreSQL: schema Prisma completo + primeira migração (requer criar conta Supabase)

4. F0-T6 — Upstash Redis · F0-T7 — MongoDB Atlas (requer criar contas)

5. F0-T9 — GitHub Actions CI/CD (lint + type-check + build em cada PR)

6. F0-T10 — Deploy backend em Railway (requer criar conta Railway)

7. F0-T8 — Smart contracts em Sepolia testnet (requer conta Alchemy + wallet de teste)

---

## Decisões Técnicas Tomadas (permanente)

| Data | Decisão | Justificação |
|------|---------|--------------|
| Jun 2026 | Stack: Next.js 14 + Fastify + Supabase + Upstash + Atlas | Performance, ecossistema, custo, DX |
| Jun 2026 | Blockchain: Ethereum EVM via Alchemy | Credibilidade, ecossistema NFT, MetaMask nativo |
| Jun 2026 | Wallets: MetaMask + Coinbase + WalletConnect | Cobertura máxima de utilizadores |
| Jun 2026 | Auth: SIWE (Sign-In With Ethereum) | Padrão da indústria, sem passwords |
| Jun 2026 | Bandeira: PNG 370×370px obrigatório, token NFT | Identidade única, não gerada |
| Jun 2026 | Biomas: eliminados — foto de capa submetida pelo utilizador | Mais autêntico, infinitamente variável |
| Jun 2026 | Token $CBEINGS: Fase 2 | Reduz complexidade inicial, cresce com a comunidade |
| Jun 2026 | Moeda padrão: USDC | Estabilidade, sem volatilidade para apostas |
| Jun 2026 | Geração de imagens: Stable Diffusion XL via Replicate | Pay-per-use, qualidade, API simples |
| Jun 2026 | Storage NFT: IPFS via Pinata | Descentralizado, permanente, padrão da indústria |
| Jun 2026 | Storage UI: Cloudinary | Transformações automáticas, moderação, CDN |
| Jun 2026 | Tailwind v3.4 + tokens em CSS variables | Estável, previsível, fiel ao brandbook |
| Jun 2026 | Next.js 14.2 + React 18 (App Router) | Versões estáveis, bem suportadas pela Vercel |
| Jun 2026 | Deploy frontend: Vercel, Root Directory = apps/web | Monorepo: Vercel precisa do path do app |

---

## Problemas Conhecidos / Blockers

- Nenhum bloqueador activo.

- Nota: o URL de produção Vercel pode pedir login a terceiros por o repositório ser privado (Deployment Protection). Normal nesta fase.

---

## Configuração do Ambiente

Repositório: github.com/realbrunoramos/cybeings (privado)

Branch principal: main

Branch de trabalho actual: main

Deploy frontend: Vercel — AO VIVO. Root Directory = apps/web. Redeploy automático a cada push para main.

URL de deploy (exemplo): https://cybeings-47trqeakw-ramosbrunopina-9658s-projects.vercel.app (URL de produção estável no painel Vercel)

Deploy backend: a configurar (Railway)

Chain activa: Sepolia testnet (mudar para mainnet na Fase 2)

Contratos deployed:

- Island: não deployed ainda

- Cybeing: não deployed ainda

- Flag: não deployed ainda

- Market: não deployed ainda

---

## Credenciais e Acessos (NUNCA valores reais aqui — só referências)

- Variáveis de ambiente: ver .env.example no repo + GitHub Secrets (a configurar)

- GitHub: realbrunoramos (conta activa)

- Vercel: ligada via GitHub (conta activa) — projecto cybeings importado

- Supabase: a criar em supabase.com

- Railway: a criar em railway.app

- Alchemy: a criar em alchemy.com

- Upstash: a criar em upstash.com

- MongoDB Atlas: a criar em mongodb.com/atlas

- Pinata: a criar em pinata.cloud

- Cloudinary: a criar em cloudinary.com

- Resend: a criar em resend.com