# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sanctuary (ELAH)** — A therapeutic safe-listening space for patients with White Coat Syndrome. Real-time voice AI sessions powered by LiveKit + Google Gemini Live, with image upload support for visual symptom analysis.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run agent:dev    # Start LiveKit voice agent in dev mode
npm run agent:connect # Connect agent to SanctuaryRoom
```

## Architecture

### Frontend (Next.js 16, App Router)
- `src/app/page.tsx` — Main page: landing screen → LiveKit voice session with orb visualizer and image upload panel
- `src/app/api/token/route.ts` — LiveKit JWT token endpoint
- `src/components/SanctuaryOrb.tsx` — Audio-reactive orb visualization
- `src/components/agents-ui/` — LiveKit agent UI components (audio visualizer aura, shader)
- `src/components/ai-elements/` — AI chat elements (message, reasoning, artifact, confirmation)
- `src/components/ui/` — shadcn/ui primitives (button, tooltip, collapsible, separator, alert, button-group)

### Backend Agent (`src/agent/agent.ts`)
- LiveKit agent using `@livekit/agents` + `@livekit/agents-plugin-google`
- Gemini Live native audio model for real-time therapeutic voice
- Handles image byte streams from client for visual analysis
- Tool: `offer_image_upload` — triggers client-side image upload prompt via RPC
- Run with `tsx` (not compiled)

### Key Integrations
- **LiveKit**: Real-time voice rooms, RPC between agent and client, byte stream for images
- **Gemini Live**: `gemini-live-2.5-flash-native-audio` for voice AI (configurable via env vars `SANCT_GEMINI_MODEL`, `SANCT_GEMINI_VOICE`)
- **shadcn/ui**: `new-york` style, RSC enabled, Tailwind CSS v4, `@/` path alias, lucide icons. CLI: `npx shadcn@latest`

## Conventions

- Language: Portuguese (pt-BR) for user-facing text, English for code
- Styling: Tailwind CSS v4 with CSS variables, dark theme (black/zinc palette with warm amber and cool cyan accents)
- Animations: `motion` (framer-motion) for UI transitions
- Fonts: Geist Sans/Mono (layout), Manrope + Cormorant Garamond italic (page)
- Path aliases: `@/*` → `./src/*`

## Environment Variables

Required in `.env.local`: `LIVEKIT_URL`, `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `GOOGLE_API_KEY`
