# Cybeings — Estado da Sessão

**Última atualização:** 3 Julho 2026
**Sessão #:** 4
**Fase atual:** Fase 0 — Fundações

---

## Estado Geral

Quatro camadas do backend em funcionamento e verificadas ponta-a-ponta: frontend (Vercel), API Fastify, PostgreSQL (Supabase) e Redis (Upstash). O health check da API responde 200 com `checks.database:"ok"` e `checks.redis:"ok"`. F0-T1, F0-T3, F0-T4, F0-T5 e F0-T6 concluídas. Frontend de F0-T10 também concluído. Faltam: F0-T7 (MongoDB), F0-T8 (smart contracts), F0-T9 (CI/CD) e F0-T10 parte 2 (deploy backend em Railway). F0-T2 (Codespaces) fica como opcional / provavelmente saltada.

---

## O que foi feito (histórico das últimas sessões)

### Sessão #4 — 3 Julho 2026

**F0-T6 concluída — Upstash Redis integrado no backend:**
- Cliente `@upstash/redis` singleton em `apps/api/src/lib/redis.ts`
- Plugin Fastify (`apps/api/src/plugins/redis.ts`) via `fastify-plugin`, com PING de sanidade no boot
- Health check enriquecido: SET/GET real ao Redis com timeout curto; 200 quando ambos ok, 503 se algum falhar
- Env `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` validadas no arranque
- Duas correções de raiz aplicadas nesta sessão (registadas nas decisões técnicas):
  1. `--env-file=.env` nativo do Node nos scripts `dev`/`start` (o Prisma v6 não carrega .env implicitamente; sem isto o servidor nem arrancava)
  2. Comparação `String(stored) === value` no health check (o SDK do Upstash faz auto-parse JSON e devolve `number` quando o valor parece numérico)
- Teste ponta-a-ponta: `{"status":"ok","checks":{"database":"ok","redis":"ok"}}`
- Commit único: `89ab96f — feat(api): integrate Upstash Redis with health check and load env natively`

**Notas operacionais:**
- Ficaram no working tree (não commitados) `apps/web/tsconfig.json` (modificado) e `apps/web/next-env.d.ts` (novo) — resíduos de builds anteriores do frontend; sem relação com F0-T6, tratar no início da próxima sessão

### Sessão #3 — 2 Julho 2026
- F0-T4 concluída (Fastify + módulos + CORS + rate limit + logging)
- F0-T5 concluída (Supabase + Prisma v6 pinado + 10 modelos + 10 enums + migração `20260702191842_init` + Prisma no Fastify + health check DB)
- Migração para Claude Code local com SSH permanente (chave `cybeings-sshkey`)
- `docs/architecture.md` e `docs/PROJECT_INSTRUCTIONS.md` v2 adicionados ao repositório
- Commits: `e965ce3`, `6728b18`, `5dfe6b0`, `a8d62cc`, `12cbdb9`

### Sessão #2 — 28 Junho 2026
- Repositório privado `realbrunoramos/cybeings` criado
- F0-T1 concluída (monorepo pnpm)
- F0-T3 concluída (frontend Next.js 14 + identidade visual)
- Deploy frontend Vercel (Root Directory = apps/web)
- `docs/PROGRESS_REPORT.md` gerado por auditoria

### Sessão #1 — Junho 2026
- Definição do produto Cybeings
- Arquitetura técnica completa (docs/architecture.md — só entrou no repo na Sessão #3)
- Stack decidida

---

## Em Curso

**Tarefa:** Nada a meio. Sessão fechada em ponto limpo.
**Branch ativa:** main
**Working tree pendente:** `apps/web/tsconfig.json` e `apps/web/next-env.d.ts` — resíduos de builds anteriores; limpar/commitar no início da próxima sessão antes de avançar

---

## Próximos Passos (por prioridade)

1. **Limpar working tree** — decidir se commitamos os regenerados do Next.js ou revertemos (30 segundos)
2. **F0-T7 — MongoDB Atlas:** criar conta, cluster, ligação e coleções `cybeing_chats` / `world_events` / `ai_logs`; adicionar terceiro check ao `/health`
3. **F0-T10 (parte 2) — Deploy backend no Railway:** criar conta Railway, configurar variáveis de ambiente, ligar ao repositório
4. **F0-T9 — GitHub Actions CI/CD:** lint + type-check + build em cada PR; deploy automático em push para main
5. **F0-T8 — Smart contracts em Sepolia:** requer conta Alchemy + wallet de teste
6. **F0-T2 — GitHub Codespaces:** OPCIONAL; com Claude Code local, deixa de ser necessário. Adiar ou saltar

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
| Jul 2026 | Fastify + fastify-plugin para decoração app.prisma/app.redis | Padrão do ecossistema Fastify |
| Jul 2026 | Rate limit temporário por IP até SIWE (TODO F1-T1) | Fallback aceite até auth existir |
| Jul 2026 | Branches: main direto na Fase 0; PRs a partir da Fase 1 | Projeto solo em fundações |
| Jul 2026 | Cliente Upstash: `@upstash/redis` (REST) em vez de `ioredis` | Serverless-friendly, sem gestão de sockets, recomendação oficial da Upstash |
| Jul 2026 | Carregamento de .env: flag nativa `--env-file=.env` do Node 20.6+ | Sem dependência de dotenv; carrega antes de qualquer módulo correr |
| Jul 2026 | Health check: comparar `String(stored) === value` para o Redis | O SDK `@upstash/redis` faz auto-parse JSON e devolve `number` quando o valor parece numérico |

---

## Problemas Conhecidos / Blockers

- Nenhum bloqueador ativo.
- Working tree pendente: `apps/web/tsconfig.json` (modificado) e `apps/web/next-env.d.ts` (novo) — resíduos de builds anteriores; tratar no início da próxima sessão.
- Nota operacional (macOS): `pnpm` está em `/opt/homebrew/bin`; sessões futuras podem precisar de `export PATH="/opt/homebrew/bin:$PATH"` — registado em CLAUDE.md.
- URL de produção Vercel pode pedir login a terceiros por o repositório ser privado (Deployment Protection). Normal nesta fase.

---

## Configuração do Ambiente

**Repositório:** github.com/realbrunoramos/cybeings (privado)
**Branch principal:** main
**Branch de trabalho atual:** main
**Git:** SSH (chave cybeings-sshkey); remote `git@github.com:realbrunoramos/cybeings.git`
**Ferramenta de execução:** Claude Code local (macOS)
**Deploy frontend:** Vercel — AO VIVO. Root Directory = apps/web. Redeploy automático a cada push
**Deploy backend:** a configurar (Railway) — F0-T10 parte 2
**Base de dados relacional:** Supabase — schema com 10 tabelas migrado; health check ponta-a-ponta OK
**Cache/pub-sub:** Upstash Redis — cliente REST integrado; health check ponta-a-ponta OK
**Base de dados não estruturada:** MongoDB Atlas — a configurar (F0-T7)
**Chain ativa:** Sepolia testnet (mudar para mainnet na Fase 2)
**Contratos deployed:**
- Island: não deployed ainda
- Cybeing: não deployed ainda
- Flag: não deployed ainda
- Market: não deployed ainda

---

## Credenciais e Acessos (referências, nunca valores reais)

- Variáveis de ambiente: ver `.env.example` no repo + `apps/api/.env` local (gitignored)
- GitHub: realbrunoramos (conta ativa; SSH cybeings-sshkey)
- Vercel: ligada via GitHub — projeto cybeings AO VIVO
- Supabase: conta criada, projeto cybeings ativo
- Upstash: conta criada, base Redis `cybeings` ativa
- Railway: a criar em railway.app
- Alchemy: a criar em alchemy.com
- MongoDB Atlas: a criar em mongodb.com/atlas
- Pinata: a criar em pinata.cloud
- Cloudinary: a criar em cloudinary.com
- Resend: a criar em resend.com
