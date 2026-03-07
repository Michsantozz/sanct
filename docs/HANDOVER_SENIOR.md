# The Sanctuary (`sanct`) - Handover Técnico Sênior

Data de atualização: 2026-03-06  
Responsável pelo handover: Codex (com base no histórico de execução e no estado atual do workspace)

---

## 1) Objetivo do produto

Aplicação de escuta terapêutica por voz para pacientes com Síndrome do Jaleco Branco.  
Experiência desejada:

1. Usuário clica em `Destravar Santuário` (ou equivalente de branding atual).
2. Frontend solicita token JWT em `/api/token`.
3. Cliente conecta no LiveKit Room via WebRTC.
4. Agente LiveKit entra na sala, inicializa Gemini Realtime Audio.
5. Conversa de voz em português-BR.
6. Visualizador (aura/orb shader) reage a estado e intensidade de áudio.

Foco de produto: acolhimento, privacidade percebida, baixa fricção.

---

## 2) Stack e versões relevantes

### Frontend / App

- Next.js `16.1.6` (Turbopack)
- React `19.2.3`
- TypeScript `5`
- Tailwind CSS `4`
- shadcn/ui + Radix UI
- Motion (`motion/react`)

### Voice / Realtime

- `@livekit/components-react` `2.9.20`
- `livekit-client` `2.17.2`
- `livekit-server-sdk` `2.15.0`
- `@livekit/agents` `1.0.48`
- `@livekit/agents-plugin-google` `1.0.48`
- Modelo em uso no agente:
  - `gemini-2.5-flash-native-audio-preview-12-2025`
  - voice: `Puck` (configurável via `SANCT_GEMINI_VOICE`)

### Observação de dependência

- Há `overrides` em `package.json`:
  - `@google/genai: 1.34.0`

---

## 3) Arquitetura funcional (estado atual)

### Diagrama de fluxo (alto nível)

```text
Browser (Next App)
  -> GET /api/token
  -> LiveKitRoom connect (wss://...)
  -> publica mic local / consome tracks remotos
  -> renderiza SanctuaryOrb (estado + áudio)

Agent Process (Windows, separado)
  -> connect room SanctuaryRoom
  -> AgentSession + Gemini realtime audio
  -> publica áudio de resposta + estado lk.agent.state
  -> tool offer_image_upload -> RPC showImageUploadPrompt -> frontend mostra botão
```

### Pontos de integração críticos

1. **Token JWT**: `src/app/api/token/route.ts`
2. **Entrada/sessão**: `src/app/page.tsx`
3. **Detecção de estado do agente**: `lk.agent.state` em `participant.attributes`
4. **Aura shader**: `src/components/agents-ui/agent-audio-visualizer-aura.tsx`
5. **Hook de animação**: `src/hooks/agents-ui/use-agent-audio-visualizer-aura.ts`
6. **Orquestração de tracks (local vs agente)**: `src/components/SanctuaryOrb.tsx`
7. **RPC agent→frontend**: tool `offer_image_upload` no agente chama `showImageUploadPrompt` no frontend via `room.localParticipant.performRpc()` / `room.registerRpcMethod()`

---

## 4) Estrutura de arquivos importantes

### Produção (núcleo)

- `src/app/page.tsx`
  - Tela principal atual (branding “ELAH” no estado atual do arquivo).
  - Estado inicial de unlock + sessão LiveKit.
  - `video={false}` confirmado no `LiveKitRoom`.
  - `ImageUploadPanel` é condicional: começa `hidden`, só aparece quando o agente chama RPC `showImageUploadPrompt`.
  - Registra RPC method via `room.registerRpcMethod()` (API não-deprecated; `localParticipant.registerRpcMethod` está deprecated em `livekit-client@2.17`).

- `src/app/api/token/route.ts`
  - Gera JWT para `room: "SanctuaryRoom"` com grants de publish/subscribe.

- `src/agent/agent.ts`
  - Agente LiveKit (processo separado).
  - Carrega `.env.local` via `dotenv`.
  - Cria `voice.AgentSession` com Gemini Realtime.
  - Contém tool `offer_image_upload` que envia RPC ao frontend para exibir botão de upload de imagem.
  - Model e voice configuráveis via env vars `SANCT_GEMINI_MODEL` e `SANCT_GEMINI_VOICE`.

- `src/components/SanctuaryOrb.tsx`
  - Resolve participante agente.
  - Mapeia estados e paleta de cores.
  - Seleciona `audioTrack` de forma contextual para reação da aura.

- `src/hooks/agents-ui/use-agent-audio-visualizer-aura.ts`
  - Define velocidade, escala, amplitude, frequência, brilho.
  - Reatividade por volume para `speaking`, `listening`, `pre-connect-buffering`.

### Experimental / Design lab

- `src/app/inspired-black/page.tsx`
  - Playground visual (não conectado ao fluxo transacional principal).
  - Alto risco de deriva visual vs produto.

- `src/app/test-vision/page.tsx`
  - Cópia do fluxo principal para testes visuais.

- `src/app/page.backup.tsx`
- `src/app/page.original.tsx`
  - Backups/cópias históricas. Fonte de confusão operacional.

---

## 5) Ambiente de execução: decisão WSL2 vs Windows

## Decisão arquitetural operacional adotada

- **Next.js** roda no **WSL2**.
- **Agente LiveKit** roda no **Windows PowerShell**.

### Motivo

No ambiente atual, o stack do agente (via rtc-node/libwebrtc) apresentou comportamento incompatível no WSL2 (problemas de ICE/RTC).  
Na prática, execução estável foi obtida ao rodar agente diretamente no Windows.

### Implicação de workflow

Quando `src/agent/agent.ts` é alterado no WSL2, é necessário copiar o arquivo para o path do projeto no Windows antes de executar o agente.

---

## 6) Runbook oficial local (funcionando)

## 6.1 Subir frontend (WSL2)

```bash
cd /home/michsantoz/sanct
npm run dev
```

Se a 3000 estiver ocupada, usar a porta informada pelo Next (ex.: `3001`).

## 6.2 Subir agente (Windows PowerShell)

```powershell
cd C:\Users\Michael\sanct
npx tsx .\src\agent\agent.ts connect --room SanctuaryRoom
```

## 6.3 Sincronizar arquivo do agente (quando editar no WSL2)

```powershell
xcopy \\wsl.localhost\Ubuntu-22.04\home\michsantoz\sanct\src\agent\agent.ts C:\Users\Michael\sanct\src\agent\ /Y
```

## 6.4 Erro comum de caminho (já ocorreu)

Se executar `npx tsx src/agent/agent.ts ...` em `C:\Users\Michael` (fora de `sanct`), ocorrerá:

- `ERR_MODULE_NOT_FOUND`
- tentativa de resolver `C:\Users\Michael\src\agent\agent.ts`

Correção: `cd C:\Users\Michael\sanct` e rodar novamente.

---

## 7) Incidentes reais encontrados (timeline técnico)

## INC-001 - Agente no WSL2 não confiável

- **Sintoma**: instabilidade/fracasso de sessão realtime no ambiente WSL2.
- **Causa**: incompatibilidade operacional do backend RTC nativo no ambiente.
- **Mitigação**: agente movido para Windows PowerShell.
- **Status**: mitigado com runbook híbrido.

## INC-002 - `ERR_MODULE_NOT_FOUND` no agente

- **Sintoma**: `Cannot find module 'C:\Users\Michael\src\agent\agent.ts'`.
- **Causa**: comando executado fora do diretório do projeto.
- **Mitigação**: padronizar `cd C:\Users\Michael\sanct`.
- **Status**: resolvido.

## INC-003 - `xcopy` sem destino explícito

- **Sintoma**: cópia aparentemente bem-sucedida, mas arquivo não no local esperado.
- **Causa**: comando sem target final.
- **Mitigação**: comando completo com destino fixo.
- **Status**: resolvido.

## INC-004 - Porta 3000 ocupada

- **Sintoma**: Next em `3001`.
- **Causa**: outro processo em `3000`.
- **Mitigação**: usar porta alocada dinamicamente ou liberar 3000.
- **Status**: mitigado (operacional).

## INC-005 - Aura só reagia à fala do agente

- **Sintoma**: sem resposta visual forte quando usuário falava.
- **Causa**: lógica de volume aplicada apenas em `state === "speaking"`.
- **Mitigação**:
  - inclusão de `listening` + `pre-connect-buffering` na reação por volume;
  - seleção dinâmica do track local do usuário vs track do agente.
- **Status**: resolvido.

## INC-006 - Lint do hook de aura por `setState` no effect

- **Sintoma**: `react-hooks/set-state-in-effect`.
- **Causa**: `setSpeed` dentro de `useEffect`.
- **Mitigação**: `speed` passou a ser valor derivado com `useMemo`.
- **Status**: resolvido no hook.

## INC-007 - Lint global ainda falhando (fora do fluxo principal)

- **Sintoma**: `npm run lint` com erro em `ai-elements/shimmer.tsx`.
- **Causa**: componente motion criado durante render.
- **Mitigação**: não corrigido neste ciclo.
- **Status**: pendente.

## INC-008 - `next build` falhando em ambiente sem acesso a Google Fonts

- **Sintoma**: falha ao buscar `Geist`/`Geist Mono`.
- **Causa**: restrição de rede no ambiente de execução.
- **Mitigação**: não resolvido no app; demanda fallback/self-host de fontes para ambientes fechados.
- **Status**: pendente.

## INC-009 - Sprawl de páginas experimentais

- **Sintoma**: múltiplas páginas backup/lab (`page.backup`, `page.original`, `test-vision`, `inspired-black`).
- **Causa**: iteração rápida de design sem limpeza.
- **Mitigação**: documentação de escopo e recomendação de consolidação.
- **Status**: pendente.

## INC-010 - Nome do modelo Gemini incorreto causa crash do agente

- **Sintoma**: `APIStatusError: models/gemini-live-2.5-flash-native-audio is not found for API version v1beta`.
- **Causa**: nome curto do modelo (`gemini-live-2.5-flash-native-audio`) não é reconhecido pela API Gemini.
- **Mitigação**: usar o nome completo `gemini-2.5-flash-native-audio-preview-12-2025`. Configurável via env var `SANCT_GEMINI_MODEL`.
- **Status**: resolvido.

## INC-011 - Gemini Realtime nem sempre chama tools proativamente

- **Sintoma**: agente fala verbalmente sobre enviar foto ("se quiser, pode me mandar uma foto") mas não chama a tool `offer_image_upload`, então o botão não aparece no frontend.
- **Causa**: modelo Gemini Realtime Audio não executa tool calls de forma confiável quando a instrução é apenas sugestiva.
- **Mitigação**: instructions do agente devem usar linguagem imperativa ("você DEVE chamar a tool") e a description da tool deve ser explícita sobre quando usar. Comportamento ainda não é 100% determinístico.
- **Status**: mitigado via prompt engineering; monitorar em produção.

---

## 8) Comportamento da aura por estado (estado atual)

Mapeamento implementado em `SanctuaryOrb.tsx` e hook de aura.

- `connecting`
  - Cor: `#38BDF8`
  - Label: `Conectando`
  - Track preferencial: agente (fallback local)

- `initializing`
  - Cor: `#A78BFA`
  - Label: `Inicializando`
  - Track preferencial: agente (fallback local)

- `pre-connect-buffering`
  - Cor: `#22D3EE`
  - Label: `Preparando`
  - Track preferencial: **local**
  - Reatividade por volume: **ativa**

- `idle`
  - Cor: `#67E8F9`
  - Label: `Pronto`
  - Track: fallback agente/local

- `listening`
  - Cor: `#2DD4BF`
  - Label: `Ouvindo`
  - Track preferencial: **local**
  - Reatividade por volume: **ativa**

- `thinking`
  - Cor: `#F59E0B`
  - Label: `Refletindo`
  - Track: fallback agente/local

- `speaking`
  - Cor: `#FB7185`
  - Label: `Falando`
  - Track preferencial: **agente**
  - Reatividade por volume: **ativa**

- `failed`
  - Cor: `#F43F5E`
  - Label: `Falha`

- `disconnected`
  - Cor: `#64748B`
  - Label: `Encerrado`

### Nota de semântica SDK

A UI usa estado cru (`lk.agent.state`).  
LiveKit recomenda getters (`canListen`, `isPending`, `isFinished`) para decisões de produto futuras.  
Recomendação: encapsular estado cru + getters num adapter de domínio (`useSanctuaryAgentState`).

---

## 9) Estado de qualidade e validações

### Typecheck

- `npx tsc --noEmit`: **passando**.

### Lint

- `npx eslint` em arquivos recém trabalhados: passou.
- `npm run lint` global: **falha** por problema pré-existente:
  - `src/components/ai-elements/shimmer.tsx` (`react-hooks/static-components`)
  - warnings em `react-shader-toy.tsx`.

### Build

- `npm run build` em ambiente com rede restrita: pode falhar por fetch de Google Fonts.

---

## 10) Riscos atuais (risk register)

## R1 - Segurança de credenciais

- Chaves sensíveis foram compartilhadas em texto durante a operação.
- Impacto potencial: uso indevido de API LiveKit/Google.
- Ação mandatória:
  - rotacionar `LIVEKIT_API_SECRET`, `LIVEKIT_API_KEY`, `GOOGLE_API_KEY`;
  - invalidar segredos antigos;
  - revisar histórico de onde foram expostos.

## R2 - Captura de câmera potencialmente habilitada

- ~~Snapshot atual de `src/app/page.tsx` contém `video={true}` no `LiveKitRoom`.~~
- **Resolvido**: `video={false}` confirmado no código atual. Câmera desligada.

## R3 - Drift de design e manutenção

- Muitos artefatos de experimento e backup no `app/`.
- Impacto: onboarding difícil, risco de editar arquivo errado.
- Ação recomendada: definir rota canonical + mover experimentos para pasta `labs/` + limpar backups.

## R4 - Dependência de fonte remota em build fechado

- Build pode quebrar sem internet por `next/font/google`.
- Ação:
  - self-host de fontes;
  - fallback local;
  - pipeline CI com cache/font assets versionados.

---

## 11) Troubleshooting playbook (comandos diretos)

## 11.1 Front não sobe em 3000

```bash
npm run dev
# observar porta no log, ex.: http://localhost:3001
```

## 11.2 Agente não encontra arquivo no Windows

```powershell
cd C:\Users\Michael\sanct
Test-Path .\src\agent\agent.ts
# esperado: True
npx tsx .\src\agent\agent.ts connect --room SanctuaryRoom
```

## 11.3 Aura não reage quando usuário fala

Checklist:

1. Estado está em `listening`/`pre-connect-buffering`?
2. `localAudioTrack` está sendo resolvido?
3. Microfone local está ativo no browser?
4. `useTrackVolume` retornando volume > 0?

Arquivos para debug:

- `src/components/SanctuaryOrb.tsx`
- `src/hooks/agents-ui/use-agent-audio-visualizer-aura.ts`

## 11.4 Token API falha

```bash
curl -i http://localhost:3000/api/token
```

Verificar envs:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `NEXT_PUBLIC_LIVEKIT_URL`

## 11.5 Lint bloqueando pipeline

```bash
npm run lint
```

Se falhar em `shimmer.tsx`, corrigir `MotionComponent` para não ser criado no render.

## 11.6 Botão de upload não aparece quando agente oferece foto

Checklist:

1. Nos logs do agente, aparece `Executing LLM tool call function: "offer_image_upload"`?
   - Se **não**: o modelo não chamou a tool. Revisar instructions do agente (deve conter "DEVE chamar a tool").
2. Se a tool foi chamada, houve erro de RPC nos logs?
   - Verificar se o frontend registrou `showImageUploadPrompt` via `room.registerRpcMethod`.
3. Frontend: o state `promptVisibility` mudou para `"prompted"`?
   - Inspecionar via React DevTools no `ImageUploadPanel`.

Arquivos para debug:

- `src/agent/agent.ts` (tool definition + instructions)
- `src/app/page.tsx` (RPC handler + estado `promptVisibility`)

---

## 12) Plano recomendado de estabilização (ordem sugerida)

## P0 (imediato)

1. Rotacionar credenciais.
2. Definir canonical app entry (`src/app/page.tsx`) e se `video` deve existir.
3. Corrigir lint fatal em `src/components/ai-elements/shimmer.tsx`.

## P1 (curto prazo)

1. Criar `docs/ops/LOCAL_RUNBOOK.md` com WSL2+Windows.
2. Criar adapter de estado LiveKit (`state + getters`) para UI.
3. Consolidar e limpar rotas experimentais/backups.

## P2 (médio prazo)

1. Instrumentação mínima (logs de estado e métricas de sessão).
2. Self-host/fallback de fontes para build determinístico.
3. Testes automatizados:
  - unit: mapeamento de estado -> visual config;
  - smoke e2e: unlock -> token -> room connect.

---

## 13) Checklist de onboarding para o próximo sênior

1. Ler este handover inteiro.
2. Executar frontend no WSL2.
3. Executar agente no Windows com comando oficial.
4. Validar sessão real em navegador:
   - unlock
   - agent joins
   - usuário fala em `listening`
   - agente responde em `speaking`
5. Rodar:
   - `npx tsc --noEmit`
   - `npm run lint` e registrar pendências.
6. Revisar decisão de câmera (`video=true`).
7. Revisar e aprovar limpeza de páginas backup/experimental.

---

## 14) Referências internas (caminhos)

- App principal:
  - `src/app/page.tsx`
  - `src/app/api/token/route.ts`
- Agente:
  - `src/agent/agent.ts`
- Visualização:
  - `src/components/SanctuaryOrb.tsx`
  - `src/components/agents-ui/agent-audio-visualizer-aura.tsx`
  - `src/hooks/agents-ui/use-agent-audio-visualizer-aura.ts`
  - `src/components/agents-ui/design-aura-orb.tsx`
- Estilo global:
  - `src/app/globals.css`
- Laboratório / experimentos:
  - `src/app/inspired-black/page.tsx`
  - `src/app/test-vision/page.tsx`
  - `src/app/page.backup.tsx`
  - `src/app/page.original.tsx`

---

## 15) Resumo executivo para decisão rápida

Estado funcional atual:

- Fluxo core de voz está funcional com arquitetura híbrida WSL2 (frontend) + Windows (agent).
- Aura agora reage também à voz do usuário no estado de escuta.
- Repositório ainda tem dívida de qualidade e organização:
  - lint global não verde;
  - múltiplas páginas experimentais/backups;
  - risco de segurança por exposição de segredos;
  - build potencialmente frágil em ambiente sem acesso externo de fontes.

Se o novo sênior precisar priorizar apenas três itens nesta semana:

1. segurança (rotação de segredos),
2. baseline de qualidade (`lint`/organização de rotas),
3. formalização de runbook híbrido e estado canônico da UI.

