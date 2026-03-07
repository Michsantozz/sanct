"use client";

import { useState } from "react";
import { Inter, PT_Serif } from "next/font/google";
import { motion, AnimatePresence } from "motion/react";
import {
  CircleDotIcon,
  EyeIcon,
  EyeOffIcon,
  HeartPulseIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  ActivityIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic", "normal"],
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginFHPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/painel-paciente-segrini";
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao autenticar.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "theme-fh min-h-svh bg-background text-foreground",
        inter.className
      )}
    >
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Left — Form                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col">
          {/* Nav */}
          <header className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
            <div className="flex items-center gap-2">
              <CircleDotIcon className="size-5 text-primary" />
              <span className="text-lg font-semibold tracking-wide text-foreground">
                ELAH
              </span>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Acesso Médico
            </span>
          </header>

          {/* Form */}
          <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              className="w-full max-w-sm"
            >
              {/* Heading */}
              <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-light tracking-tight text-foreground">
                  Bem-vindo,{" "}
                  <em
                    className={cn(
                      "not-italic font-normal text-primary",
                      ptSerif.className
                    )}
                  >
                    Doutor
                  </em>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acesse seus painéis de consulta, pacientes e transcrições
                </p>
              </div>

              {/* Form fields */}
              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold tracking-wider uppercase text-muted-foreground"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="dr.gustavo@elah.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-border bg-card pl-11 pr-4 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold tracking-wider uppercase text-muted-foreground"
                    >
                      Senha
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-border bg-card pl-11 pr-12 text-sm shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Erro */}
                {error && (
                  <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-primary text-sm font-semibold tracking-wide text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
                >
                  {loading ? "Entrando…" : "Entrar no Painel"}
                </Button>

                {/* Separator */}
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                    ou
                  </span>
                  <Separator className="flex-1" />
                </div>

                {/* CRM Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-border bg-card text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-secondary"
                >
                  <ShieldCheckIcon className="size-4 text-primary" />
                  Acessar com CRM Digital
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Não tem acesso?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Solicitar cadastro
                </button>
              </p>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-center gap-4 px-6 pb-6 text-[11px] text-muted-foreground md:px-10">
            <span>© 2026 ELAH Sanctuary</span>
            <span>·</span>
            <button
              type="button"
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </button>
            <span>·</span>
            <button
              type="button"
              className="hover:text-foreground transition-colors"
            >
              Termos de Uso
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right — Visual panel                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative hidden overflow-hidden bg-[#2A2B2F] lg:block">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Gradient orbs */}
          <div className="absolute -left-32 -top-32 size-96 rounded-full bg-[#B05A36]/20 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[#2A9D8F]/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B05A36]/10 blur-[80px]" />

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center px-12">
            {/* Animated orb */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="mb-12"
            >
              <div className="relative flex size-32 items-center justify-center">
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="absolute inset-3 rounded-full border border-white/[0.07]" />
                <div className="absolute inset-6 rounded-full border border-white/[0.05]" />
                {/* Core */}
                <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#B05A36] to-[#8E4829]">
                  <HeartPulseIcon className="size-7 text-white/90" />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="max-w-md text-center"
            >
              <h2
                className={cn(
                  "text-3xl font-light leading-snug text-white/90",
                  ptSerif.className
                )}
              >
                Da consulta ao painel do paciente,{" "}
                <em className="text-[#E8A97A]">automaticamente</em>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                O ELAH grava, transcreve e estrutura cada consulta em tempo
                real. Exame psíquico, conduta e resumo do paciente gerados
                por IA — para o médico focar no que importa.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "42min", label: "Consulta transcrita", icon: ActivityIcon },
                { value: "< 30s", label: "Painel gerado por IA", icon: HeartPulseIcon },
                { value: "100%", label: "Automático via áudio", icon: ShieldCheckIcon },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto mb-2 size-4 text-[#B05A36]/60" />
                  <p className="text-xl font-semibold text-white/80">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-16 max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 backdrop-blur-sm"
            >
              <p
                className={cn(
                  "text-sm leading-relaxed text-white/60",
                  ptSerif.className
                )}
              >
                &ldquo;O painel que o ELAH gera é o que eu sempre quis
                entregar no final da consulta. Limpo, humano, sem jargão
                médico. Os pais entendem tudo.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#B05A36]/30 text-xs font-bold text-[#E8A97A]">
                  GS
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70">
                    Dr. Gustavo Segrini
                  </p>
                  <p className="text-[11px] text-white/35">
                    Médico de Família — Saúde Mental · ES
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
