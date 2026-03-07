"use client";

import { useMemo, type CSSProperties } from "react";
import { Track } from "livekit-client";
import { motion } from "motion/react";
import {
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  type AgentState,
} from "@livekit/components-react";
import { AgentAudioVisualizerAura } from "@/components/agents-ui/agent-audio-visualizer-aura";

function useAgentParticipant() {
  const remoteParticipants = useRemoteParticipants();

  return useMemo(() => {
    return remoteParticipants.find((p) => {
      const agentState = p.attributes?.["lk.agent.state"];
      return agentState !== undefined;
    });
  }, [remoteParticipants]);
}

function useAgentState(
  attributes: Record<string, string> | undefined
): AgentState {
  const raw = attributes?.["lk.agent.state"];

  switch (raw) {
    case "pre-connect-buffering":
    case "idle":
    case "listening":
    case "thinking":
    case "speaking":
    case "failed":
    case "disconnected":
      return raw;
    case "initializing":
      return "initializing" as AgentState;
    default:
      return "connecting";
  }
}

interface AuraVisualConfig {
  color: `#${string}`;
  colorShift: number;
  label: string;
  helperText: string;
}

function getAuraVisualConfig(state: AgentState): AuraVisualConfig {
  switch (state) {
    case "listening":
      return {
        color: "#2DD4BF",
        colorShift: 0.2,
        label: "Ouvindo",
        helperText: "Estou aqui com você. Pode continuar.",
      };
    case "thinking":
      return {
        color: "#F59E0B",
        colorShift: 0.18,
        label: "Refletindo",
        helperText: "Organizando uma resposta cuidadosa.",
      };
    case "speaking":
      return {
        color: "#FB7185",
        colorShift: 0.3,
        label: "Falando",
        helperText: "Resposta em voz ativa neste momento.",
      };
    case "initializing":
      return {
        color: "#A78BFA",
        colorShift: 0.12,
        label: "Inicializando",
        helperText: "Ajustando os canais do santuário.",
      };
    case "pre-connect-buffering":
      return {
        color: "#22D3EE",
        colorShift: 0.18,
        label: "Preparando",
        helperText: "Pode falar. O santuário está pronto para captar sua voz.",
      };
    case "idle":
      return {
        color: "#67E8F9",
        colorShift: 0.14,
        label: "Pronto",
        helperText: "Quando quiser, comece a falar.",
      };
    case "failed":
      return {
        color: "#F43F5E",
        colorShift: 0.05,
        label: "Falha",
        helperText: "Houve uma instabilidade na sessão.",
      };
    case "disconnected":
      return {
        color: "#64748B",
        colorShift: 0.04,
        label: "Encerrado",
        helperText: "Sessão finalizada.",
      };
    default:
      return {
        color: "#38BDF8",
        colorShift: 0.15,
        label: "Conectando",
        helperText: "Estabelecendo o vínculo com segurança.",
      };
  }
}

function hexToRgba(hex: `#${string}`, alpha: number): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return `rgba(56, 189, 248, ${alpha})`;
  }

  const numeric = Number.parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SanctuaryOrb() {
  const agentParticipant = useAgentParticipant();
  const { localParticipant } = useLocalParticipant();
  const agentState = useAgentState(agentParticipant?.attributes);
  const visual = getAuraVisualConfig(agentState);

  const tracks = useTracks([Track.Source.Microphone]);

  const agentAudioTrack = useMemo(() => {
    if (!agentParticipant) return undefined;
    return tracks.find(
      (t) => t.participant.identity === agentParticipant.identity
    );
  }, [tracks, agentParticipant]);

  const localAudioTrack = useMemo(() => {
    return tracks.find(
      (t) => t.participant.identity === localParticipant.identity
    );
  }, [tracks, localParticipant.identity]);

  const reactiveAudioTrack = useMemo(() => {
    if (agentState === "listening" || agentState === "pre-connect-buffering") {
      return localAudioTrack ?? agentAudioTrack;
    }

    if (agentState === "speaking") {
      return agentAudioTrack ?? localAudioTrack;
    }

    return agentAudioTrack ?? localAudioTrack;
  }, [agentAudioTrack, localAudioTrack, agentState]);

  const auraGlow = useMemo(
    () =>
      ({
        background: `radial-gradient(circle, ${hexToRgba(
          visual.color,
          0.38
        )} 0%, ${hexToRgba(visual.color, 0.06)} 46%, transparent 72%)`,
      }) satisfies CSSProperties,
    [visual.color]
  );

  return (
    <div className="relative flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={auraGlow}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative"
      >
        <AgentAudioVisualizerAura
          size="xl"
          state={agentState}
          audioTrack={reactiveAudioTrack}
          color={visual.color}
          colorShift={visual.colorShift}
          themeMode="dark"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/70 px-4 py-2 text-xs tracking-[0.24em] text-zinc-300 uppercase backdrop-blur-md">
          <span
            className="h-2.5 w-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: visual.color }}
          />
          {visual.label}
        </div>

        <p className="max-w-md text-sm leading-relaxed tracking-[0.08em] text-zinc-400">
          {visual.helperText}
        </p>

        <p className="text-[11px] tracking-[0.22em] text-zinc-600 uppercase select-none">
          Seus dados estão protegidos. Pode falar.
        </p>
      </motion.div>
    </div>
  );
}
