# CLAUDE.md — Cybeings Project

> Ficheiro lido automaticamente pelo Claude Code no início de cada sessão.
> Para instruções completas do projecto, ver /docs/SESSION_STATE.md.

---

## PRIMEIRA ACÇÃO OBRIGATÓRIA

Antes de qualquer outra coisa, lê /docs/SESSION_STATE.md e confirma o estado actual ao utilizador.

---

## Projecto

**Cybeings** — Plataforma web de seres digitais com IA, mundo interactivo e economia cripto.

- Frontend: Next.js 14 + TypeScript + Tailwind (Vercel)
- Backend: Node.js 20 + Fastify + TypeScript (Railway)
- BD: PostgreSQL/Supabase + Redis/Upstash + MongoDB/Atlas
- Blockchain: Ethereum EVM via Alchemy · wagmi + RainbowKit
- IA: OpenAI GPT-4o (personalidade) + Replicate SDXL (imagens)
- Storage: Pinata/IPFS (NFTs) + Cloudinary (imagens UI)

## Comandos essenciais

```bash
pnpm install          # instalar dependências (monorepo)
pnpm dev              # iniciar todos os apps em desenvolvimento
pnpm build            # build de produção
pnpm lint             # ESLint
pnpm type-check       # TypeScript sem emit
pnpm test             # Vitest
cd apps/api && pnpm prisma migrate dev    # migrações DB
cd apps/api && pnpm prisma studio        # GUI da base de dados
```

## Estrutura do monorepo

```
apps/web/             → Next.js frontend
apps/api/             → Fastify backend
packages/contracts/   → Smart contracts Solidity
packages/shared/      → Types partilhados
packages/ui/          → Design system
docs/                 → Documentação e SESSION_STATE.md
```

## Convenções de código

- TypeScript strict — sem any não justificado
- Commits em inglês: feat:, fix:, docs:, chore:, refactor:
- Branches: feature/, fix/, docs/
- Nunca commitar directamente para main (excepto SESSION_STATE.md no fim de sessão)
- Error handling obrigatório em todos os paths async
- Sem console.log em produção — usar logger (Axiom)
- Variáveis de ambiente: nunca hardcodar, sempre .env.local / GitHub Secrets

## Regras críticas de produto

- Bandeira da ilha: PNG exactamente 370×370px — validação server-side com sharp
- Foto de capa: qualquer resolução, crop automático via Cloudinary
- Autenticação: SIWE — nunca passwords
- Confirmação de pagamento: só após verificação on-chain via Alchemy webhook
- Token $CBEINGS: não implementar — é Fase 2

## Fim de sessão

Sempre actualizar /docs/SESSION_STATE.md e fazer commit:

```
docs: update session state — [data] — [resumo em 1 linha]
```

## Environment notes

- `pnpm` is installed at `/opt/homebrew/bin/pnpm` and is not on the default PATH in the Claude Code shell.
- Every command that uses `pnpm` (or `node`, `npx`, `tsc`) must be prefixed with `export PATH="/opt/homebrew/bin:$PATH"`, or chained: `export PATH="/opt/homebrew/bin:$PATH" && pnpm …`
- Git remote is SSH: `git@github.com:realbrunoramos/cybeings.git` — SSH key `~/.ssh/id_ed25519` is configured and working.
- Prisma is pinned to v6 (Prisma v7 has known open issues with Supabase). Do not upgrade to v7 without explicit approval.

## Referência completa

Ver /docs/architecture.md para arquitectura completa, schema da BD, fluxos e estimativas.