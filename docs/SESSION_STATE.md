# Cybeings — Estado da Sessão

**Última atualização:** 2 Julho 2026
**Sessão #:** 3
**Fase atual:** Fase 0 — Fundações

---

## Estado Geral

Fundações consolidadas. As três camadas principais (frontend, backend, base de dados) estão de pé e a comunicar. O frontend está ao vivo na Vercel; o backend arranca e liga-se à Supabase automaticamente; o schema completo (10 tabelas + 10 enums) está migrado. F0-T1, F0-T3, F0-T4 e F0-T5 concluídas. Frontend de F0-T10 também concluído. Mudança operacional importante nesta sessão: passagem da extensão do Chrome para o Claude Code local, com autenticação SSH configurada.

---

## O que foi feito (histórico das últimas sessões)

### Sessão #3 — 2 Julho 2026

**Backend (F0-T4) concluída:**
- Fastify montado com CORS, rate limiting (IP como fallback temporário — TODO F1-T1), logging pino-pretty em dev
- Módulos de rotas: health, auth, island, cybeing, tournament, marketplace
- Servidor com type-check + build limpos

**Base de dados (F0-T5) concluída:**
- Projeto Supabase `cybeings` criado (região West EU / London ou Frankfurt), plano Free
- Prisma pinado em v6 (v7 tem incompatibilidades abertas com Supabase — decisão registada)
- Schema com 10 modelos + 10 enums (User, Island, FlagHistory, Cybeing, Listing, Bid, Tournament, TournamentEntry, Rental, Transaction)
- Primeira migração `20260702191842_init` aplicada com sucesso — todas as tabelas existem na Supabase
- Cliente Prisma singleton, plugin Fastify, decoração `app.prisma` via fastify-plugin
- Health check enriquecido: `GET /health` → 200 com `checks.database: "ok"` quando a BD está OK; 503 se cair
- Teste ponta-a-ponta com curl: `{"status":"ok","service":"cybeings-api","checks":{"database":"ok"}}`

**Migração de ferramenta e infraestrutura:**
- Passagem da extensão do Chrome para o Claude Code local (macOS, Node 20+, pnpm em /opt/homebrew/bin)
- Chave SSH `cybeings-sshkey` (ed25519) gerada e registada no GitHub; remote passou a `git@github.com:realbrunoramos/cybeings.git`; push automático sem intervenção manual daqui em diante
- CLAUDE.md atualizado com Environment notes (pnpm path, Prisma v6 pin)

**Documentação e governança:**
- `docs/architecture.md` adicionado ao repositório (v1.0, Junho 2026)
- `docs/PROJECT_INSTRUCTIONS.md` v2 adicionado (versão adaptada ao Claude Code em substituição da v1 da extensão do Chrome)
- `docs/PROGRESS_REPORT.md` gerado por auditoria (Sessão #2)

**Commits nesta sessão:**
- `e965ce3` — feat(api): wire Fastify server with CORS, rate limiting and logging
- `6728b18` — chore: add environment notes to CLAUDE.md
- `5dfe6b0` — feat(db): pin Prisma v6, add architecture doc, add PROJECT_INSTRUCTIONS v2, init Prisma schema with 10 models
- `a8d62cc` — feat(api): wire Prisma client into Fastify and expose DB health check

### Sessão #2 — 28 Junho 2026
- Repositório `realbrunoramos/cybeings` criado (privado)
- F0-T1 concluída: monorepo pnpm (apps/web, apps/api, packages/shared, packages/ui, packages/contracts)
- F0-T3 concluída: frontend Next.js 14 + Tailwind + tokens Cybeings + landing page com identidade visual
- Deploy do frontend na Vercel (Root Directory = apps/web), redeploy automático a cada push
- Relatório de auditoria em docs/PROGRESS_REPORT.md

### Sessão #1 — Junho 2026
- Definição do conceito de produto Cybeings
- Arquitetura técnica completa (docs/architecture.md — só entrou no repo na Sessão #3)
- Stack decidida

---

## Em Curso

**Tarefa:** Nada a meio. Sessão fechada em ponto limpo.
**Branch ativa:** main
**Próximo passo concreto:** F0-T6 (Upstash Redis) — requer criar conta Upstash antes.

---

## Próximos Passos (por prioridade)

1. **F0-T6 — Upstash Redis:** criar conta, obter URL/token, adicionar cliente ao backend e ao health check.
2. **F0-T7 — MongoDB Atlas:** criar conta, cluster, ligação e coleções cybeing_chats / world_events / ai_logs.
3. **F0-T9 — GitHub Actions CI/CD:** lint + type-check + build em cada PR; deploy automático em push para main.
4. **F0-T10 (parte 2) — Deploy backend no Railway:** requer conta Railway; variáveis de ambiente e health check ligados.
5. **F0-T8 — Smart contracts em Sepolia:** requer conta Alchemy + wallet de teste.
6. **F0-T2 — GitHub Codespaces:** OPCIONAL; com Claude Code local, deixa de ser necessário. Adiar ou saltar.

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
| Jun 2026 | Geração de imagens: Stable Diffusion XL via Replicate | Pay-per-use, qualidade, API simples |
| Jun 2026 | Storage NFT: IPFS via Pinata | Descentralizado, permanente, padrão da indústria |
| Jun 2026 | Storage UI: Cloudinary | Transformações automáticas, moderação, CDN |
| Jun 2026 | Tailwind v3.4 + tokens em CSS variables | Estável, previsível, fiel ao brandbook |
| Jun 2026 | Next.js 14.2 + React 18 (App Router) | Versões estáveis, bem suportadas pela Vercel |
| Jun 2026 | Deploy frontend: Vercel, Root Directory = apps/web | Monorepo: Vercel precisa do path da app |
| Jul 2026 | Ferramenta de execução: Claude Code local | Compila, testa e faz push antes de commitar; substitui extensão do Chrome |
| Jul 2026 | Autenticação Git: SSH (chave cybeings-sshkey) | Push automático a partir do Claude Code |
| Jul 2026 | Prisma pinado em v6 | v7 tem incompatibilidades abertas com Supabase |
| Jul 2026 | Fastify + fastify-plugin para decoração app.prisma | Padrão do ecossistema Fastify |
| Jul 2026 | Rate limit temporário por IP até SIWE (TODO F1-T1) | Fallback aceite até auth existir |
| Jul 2026 | Branches: main direto na Fase 0; PRs a partir da Fase 1 | Projeto solo em fundações |

---

## Problemas Conhecidos / Blockers

- Nenhum bloqueador ativo.
- Nota: URL de produção Vercel pode pedir login a terceiros por o repositório ser privado (Deployment Protection). Normal nesta fase.
- Nota operacional (macOS): `pnpm` está em `/opt/homebrew/bin`; sessões futuras podem precisar de `export PATH="/opt/homebrew/bin:$PATH"` — registado em CLAUDE.md.

---

## Configuração do Ambiente

**Repositório:** github.com/realbrunoramos/cybeings (privado)
**Branch principal:** main
**Branch de trabalho atual:** main
**Git:** SSH (chave cybeings-sshkey); remote git@github.com:realbrunoramos/cybeings.git
**Ferramenta de execução:** Claude Code local (macOS)
**Deploy frontend:** Vercel — AO VIVO. Root Directory = apps/web. Redeploy automático a cada push.
**Deploy backend:** a configurar (Railway) — F0-T10 parte 2
**Base de dados:** Supabase (projeto cybeings) — schema com 10 tabelas migrado; health check ponta-a-ponta a passar
**Chain ativa:** Sepolia testnet (mudar para mainnet na Fase 2)
**Contratos deployed:**
- Island: não deployed ainda
- Cybeing: não deployed ainda
- Flag: não deployed ainda
- Market: não deployed ainda

---

## Credenciais e Acessos (referências, nunca valores reais)

- Variáveis de ambiente: ver .env.example no repo + apps/api/.env local (gitignored)
- GitHub: realbrunoramos (conta ativa; SSH cybeings-sshkey)
- Vercel: ligada via GitHub — projeto cybeings AO VIVO
- Supabase: conta criada, projeto cybeings ativo
- Railway: a criar em railway.app
- Alchemy: a criar em alchemy.com
- Upstash: a criar em upstash.com
- MongoDB Atlas: a criar em mongodb.com/atlas
- Pinata: a criar em pinata.cloud
- Cloudinary: a criar em cloudinary.com
- Resend: a criar em resend.com
