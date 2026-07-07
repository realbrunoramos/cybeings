# Cybeings — Estado da Sessão

**Última atualização:** 6 Julho 2026
**Sessão #:** 6
**Fase atual:** Fase 0 — Fundações (a fechar; falta F0-T8)

## Estado Geral

Sessão de manutenção e resolução de dívida técnica. Backend continua ao vivo
em https://cybeingsapi-production.up.railway.app (health check verde). Nada em
main foi alterado — todas as mudanças ficaram na branch feature/hero-3d.

## O que foi feito na Sessão #6

- **Descoberta:** trabalho externo de outra IA no frontend (figura 3D
  hero + upgrades não pedidos Next 14→15 e React 18→19).
- **Decisão:** aceitar upgrades e figura 3D, commitar em branch separada
  (não em main), sem Cloudinary por limite de 10MB em plano free.
- **Branch feature/hero-3d criada e enviada:** commit 4a28c06.
  Vercel deve ter gerado preview automático — por verificar.
- **F0-T8 arrancada mas não concluída:** decidido gerar chave privada
  Ethereum localmente (não usar MetaMask smart wallet). Prompt preparado
  mas não executado no Claude Code.

## Em Curso

- Branch feature/hero-3d à espera de decisão (merge para main após validar
  preview Vercel, ou reverter)
- F0-T8a por arrancar: gerar wallet Ethereum de deploy, criar conta
  Alchemy, obter ETH da Sepolia faucet

## Próximos Passos

1. Verificar preview Vercel da branch feature/hero-3d
2. Decidir: merge para main, manter como feature em paralelo, ou reverter
3. Retomar F0-T8 do início (gerar wallet local + Alchemy + faucet)
4. Fase 0 fecha só com F0-T8 completa

## Decisões Técnicas desta sessão

| Data | Decisão | Justificação |
|------|---------|--------------|
| Jul 2026 | Aceitar Next 15 + React 19 (violação de decisão prévia) | Preservar trabalho externo já feito no frontend |
| Jul 2026 | Modelo 3D (.glb 12MB) commitado no repo, não Cloudinary | Free tier Cloudinary rejeita >10MB |
| Jul 2026 | Deploy Sepolia via chave privada local (não MetaMask) | MetaMask 2026 usa smart wallet sem seed exportável |

## Blockers / Dívida técnica registada

- Next 15 + React 19 podem ter breaking changes por descobrir
- Modelo 3D pesa 12MB — considerar compressão Draco/meshopt antes do merge
- CSS local partido no dev server — limpar .next e reinstalar no próximo arranque
