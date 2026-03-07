"use client";

import { useState, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { motion } from "motion/react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Button } from "@/components/ui/button";
import { SanctuaryOrb } from "@/components/SanctuaryOrb";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
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
          video={false} // Mantem original apenas com audio
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

            <footer className="text-center text-xs tracking-[0.18em] text-zinc-500 uppercase">
              Respire fundo. Fale no seu ritmo.
            </footer>
          </main>
        </LiveKitRoom>
      )}
    </div>
  );
}
