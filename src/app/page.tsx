"use client";

import { useState, useCallback, useRef, useEffect, type ChangeEvent } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import type { RpcInvocationData } from "livekit-client";
import { motion, AnimatePresence } from "motion/react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Button } from "@/components/ui/button";
import { SanctuaryOrb } from "@/components/SanctuaryOrb";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const IMAGE_UPLOAD_TOPIC = "images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_INPUT = "image/jpeg,image/png,image/webp";
const ACCEPTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "700"] });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
});

interface TokenResponse {
  token: string;
}

interface ErrorResponse {
  error: string;
}

type ImageUploadStatus = "idle" | "sending" | "analyzing" | "error";
type ImagePromptVisibility = "hidden" | "prompted";

interface ImagePromptPayload {
  title: string;
  message: string;
  label: string;
  kind: string;
}

function formatFileSize(sizeInBytes: number): string {
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageUploadPanel() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [promptVisibility, setPromptVisibility] =
    useState<ImagePromptVisibility>("hidden");
  const [promptPayload, setPromptPayload] =
    useState<ImagePromptPayload | null>(null);
  const [uploadStatus, setUploadStatus] = useState<ImageUploadStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusResetTimeoutRef = useRef<number | null>(null);

  // Register RPC method so the agent can prompt image upload
  useEffect(() => {
    if (!room) return;

    room.registerRpcMethod(
      "showImageUploadPrompt",
      async (data: RpcInvocationData) => {
        const payload = JSON.parse(data.payload) as ImagePromptPayload;
        setPromptPayload(payload);
        setPromptVisibility("prompted");
        setUploadStatus("idle");
        setStatusMessage(null);
        return JSON.stringify({ status: "prompted" });
      }
    );

    return () => {
      room.unregisterRpcMethod("showImageUploadPrompt");
    };
  }, [room]);

  const clearStatusReset = useCallback(() => {
    if (statusResetTimeoutRef.current !== null) {
      window.clearTimeout(statusResetTimeoutRef.current);
      statusResetTimeoutRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearStatusReset();
    setPromptVisibility("hidden");
    setPromptPayload(null);
    setUploadStatus("idle");
    setStatusMessage(null);
  }, [clearStatusReset]);

  const resetStatusSoon = useCallback(() => {
    clearStatusReset();
    statusResetTimeoutRef.current = window.setTimeout(() => {
      dismiss();
    }, 5000);
  }, [clearStatusReset, dismiss]);

  useEffect(() => {
    return () => {
      clearStatusReset();
    };
  }, [clearStatusReset]);

  const handleOpenPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      event.target.value = "";

      if (!selectedFile) return;

      if (!localParticipant) {
        setUploadStatus("error");
        setStatusMessage("Participante local indisponível para envio.");
        resetStatusSoon();
        return;
      }

      if (!ACCEPTED_IMAGE_MIME_TYPES.has(selectedFile.type)) {
        setUploadStatus("error");
        setStatusMessage("Formato inválido. Use JPEG, PNG ou WEBP.");
        resetStatusSoon();
        return;
      }

      if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadStatus("error");
        setStatusMessage(
          `Arquivo acima do limite de ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`
        );
        resetStatusSoon();
        return;
      }

      setUploadStatus("sending");
      setStatusMessage(`Enviando ${selectedFile.name}...`);

      try {
        await localParticipant.sendFile(selectedFile, {
          topic: IMAGE_UPLOAD_TOPIC,
          mimeType: selectedFile.type,
        });

        setUploadStatus("analyzing");
        setStatusMessage("Foto enviada. Vou analisar com você em voz.");
        resetStatusSoon();
      } catch (err: unknown) {
        const reason =
          err instanceof Error ? err.message : "Falha ao enviar imagem.";
        setUploadStatus("error");
        setStatusMessage(reason);
        resetStatusSoon();
      }
    },
    [localParticipant, resetStatusSoon]
  );

  const statusToneClass =
    uploadStatus === "error"
      ? "text-rose-300"
      : uploadStatus === "analyzing" || uploadStatus === "sending"
        ? "text-cyan-300"
        : "text-zinc-400";

  return (
    <AnimatePresence>
      {promptVisibility === "prompted" && promptPayload && (
        <motion.section
          key="image-prompt"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-6xl"
        >
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-4 backdrop-blur-md md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] tracking-[0.24em] text-zinc-500 uppercase">
                  {promptPayload.title}
                </p>
                <p className={`text-sm leading-relaxed ${statusToneClass}`}>
                  {statusMessage ?? promptPayload.message}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_INPUT}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={dismiss}
                  className="h-11 rounded-full border-zinc-600/40 bg-zinc-900/70 px-5 text-[11px] font-semibold tracking-[0.2em] text-zinc-400 uppercase hover:border-zinc-500/60 hover:bg-zinc-900"
                >
                  Agora não
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenPicker}
                  disabled={uploadStatus === "sending"}
                  className="h-11 rounded-full border-cyan-300/35 bg-zinc-900/70 px-6 text-[11px] font-semibold tracking-[0.2em] text-zinc-200 uppercase hover:border-cyan-200/60 hover:bg-zinc-900"
                >
                  {uploadStatus === "sending"
                    ? "Enviando..."
                    : promptPayload.label}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/token");

      if (!response.ok) {
        const body = (await response.json()) as ErrorResponse;
        throw new Error(body.error ?? "Failed to obtain access token.");
      }

      const data = (await response.json()) as TokenResponse;
      setToken(data.token);
      setHasStarted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className={`min-h-screen w-full bg-black text-zinc-100 ${manrope.className}`}
    >
      {!hasStarted ? (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-10 md:px-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(195,138,86,0.16)_0%,rgba(15,15,15,0.88)_40%,rgba(0,0,0,1)_74%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_74%,rgba(79,138,171,0.14)_0%,rgba(0,0,0,0)_48%)]" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0.22),rgba(255,255,255,0.02))]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:100%_10px] opacity-30" />
            <div className="absolute -left-28 top-8 h-80 w-80 rounded-full bg-[#D18D5B]/12 blur-[140px] sanctuary-drift" />
            <div className="absolute -right-24 bottom-0 h-[34rem] w-[34rem] rounded-full bg-[#7DB3D5]/14 blur-[160px] sanctuary-drift-delayed" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2.2rem] border border-white/15 bg-zinc-950/70 px-6 py-8 backdrop-blur-2xl md:px-10 md:py-10"
          >
            <div className="pointer-events-none absolute -right-22 top-1/2 hidden -translate-y-1/2 text-[18rem] leading-none font-semibold tracking-[-0.08em] text-zinc-100/[0.03] md:block">
              ELAH
            </div>

            <div className="grid gap-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] md:gap-10">
              <aside className="flex flex-col justify-between border-b border-white/10 pb-6 md:border-r md:border-b-0 md:pb-0 md:pr-8">
                <div className="space-y-4">
                  <p className="text-[11px] tracking-[0.36em] text-zinc-500 uppercase">
                    Minimal Clinical Safe Space
                  </p>
                  <p className="text-5xl leading-[0.86] font-semibold tracking-[-0.05em] text-zinc-100 md:text-6xl">
                    ELAH
                  </p>
                </div>
                <p className="mt-8 max-w-[18rem] text-xs leading-relaxed tracking-[0.2em] text-zinc-400 uppercase md:mt-0">
                  O fim do julgamento clínico.
                </p>
              </aside>

              <section className="space-y-7">
                <h1
                  className={`${cormorant.className} text-5xl leading-[0.9] tracking-tight text-zinc-100 md:text-7xl`}
                >
                  <span className="block">Take a breath.</span>
                  <span className="block text-zinc-300">Nobody is watching.</span>
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-zinc-300 md:text-[1.1rem]">
                  <span className="block">
                    I know the white coats make you anxious.
                  </span>
                  <span className="block">You don&apos;t have to be brave here.</span>
                  <span className="block">I&apos;m Elah.</span>
                </p>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleUnlock}
                    disabled={isLoading}
                    className="h-14 rounded-full border-[#C88C5D]/55 bg-[#17130F]/72 px-8 text-xs font-semibold tracking-[0.28em] text-zinc-100 uppercase transition-all duration-300 hover:border-[#E4AA7B] hover:bg-[#2A1D12]"
                  >
                    {isLoading ? "Connecting..." : "Enter ELAH"}
                  </Button>

                  <p className="text-[11px] tracking-[0.26em] text-zinc-500 uppercase">
                    Nobody is judging your voice here.
                  </p>
                </div>
              </section>
            </div>

            {error && (
              <p className="pt-6 text-xs tracking-wide text-red-300/85">
                {error}
              </p>
            )}
          </motion.div>
        </main>
      ) : (
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={false}
          className="relative min-h-screen w-full overflow-hidden"
        >
          <RoomAudioRenderer />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,20,26,0.9)_0%,rgba(0,0,0,1)_60%)]" />
            <div className="absolute -top-24 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-400/12 blur-[150px] sanctuary-drift" />
            <div className="absolute -bottom-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-rose-400/10 blur-[180px] sanctuary-drift-delayed" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.68)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:100%_10px] opacity-20" />
          </div>

          <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-between px-6 py-8 md:px-10 md:py-10">
            <header className="flex w-full max-w-6xl items-center justify-between text-[11px] uppercase tracking-[0.3em] text-zinc-500">
              <span>Sessão Ativa</span>
              <span className="hidden md:inline">Canal de voz protegido</span>
            </header>

            <section className="flex w-full flex-1 items-center justify-center">
              <SanctuaryOrb />
            </section>

            <ImageUploadPanel />

            <footer className="space-y-2 text-center">
              <p className="text-xs tracking-[0.18em] text-zinc-500 uppercase">
                Respire fundo. Fale no seu ritmo.
              </p>
              <p className="text-[11px] tracking-[0.16em] text-zinc-600 uppercase">
                A câmera permanece desligada nesta sessão.
              </p>
            </footer>
          </main>
        </LiveKitRoom>
      )}
    </div>
  );
}
