"use client";

import { useState } from "react";
import { Inter, PT_Serif } from "next/font/google";
import { motion, AnimatePresence } from "motion/react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BrainIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDotIcon,
  ClipboardListIcon,
  ClockIcon,
  EarIcon,
  EyeIcon,
  FileTextIcon,
  HeartPulseIcon,
  MicIcon,
  PillIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
// Types
// ---------------------------------------------------------------------------

interface ExamItem {
  category: string;
  icon: React.ElementType;
  finding: string;
  severity: "normal" | "attention" | "alert" | "critical";
  detail?: string;
}

interface TimelineEntry {
  date: string;
  type: "consulta" | "internacao" | "medicacao" | "evento";
  title: string;
  detail?: string;
}

// ---------------------------------------------------------------------------
// Mock data — based on the real conversation example
// ---------------------------------------------------------------------------

const PATIENT = {
  name: "Ana Beatriz S.",
  age: 34,
  prontuario: "MF-2026-0847",
  cid: "F32.2 — Episódio depressivo grave sem sintomas psicóticos",
  medico: "Dr. Gustavo Segrini",
  especialidade: "Médico de Família — Saúde Mental",
  crm: "CRM-ES 12.345",
  dataConsulta: "06 de Março, 2026",
  horaConsulta: "14:30",
  duracaoConsulta: "42 min",
  fonteAudio: "Noa Notes — gravação em consultório",
};

const TRANSCRIPTION_EXCERPT = {
  paciente:
    "Doutor, eu tô um lixo. Não tenho vontade de sair da cama. Minha cabeça não para, parece que tem um motor, mas o corpo não vai. Choro todo dia.",
  medico:
    "Calma, Ana. Percebo que você está tremendo bastante hoje e não consegue nem olhar nos meus olhos direito. Como estão as vozes que você falou da última vez?",
  paciente2:
    "Pararam, doutor. Mas eu continuo achando que a vida não vale a pena.",
};

const EXAME_PSIQUICO: ExamItem[] = [
  {
    category: "Apresentação / Atitude",
    icon: UserIcon,
    finding: "Retraída, com contato visual prejudicado",
    severity: "attention",
    detail:
      "Paciente entrou no consultório com postura curvada, evitando contato visual direto. Vestuário adequado mas com sinais de descuido na higiene pessoal (cabelos desalinhados). Colaborativa, porém com latência nas respostas.",
  },
  {
    category: "Psicomotricidade",
    icon: ActivityIcon,
    finding: "Inquietação motora evidente (tremores)",
    severity: "attention",
    detail:
      "Tremores finos em extremidades superiores observados durante toda a consulta. Agitação psicomotora leve com movimentos repetitivos das mãos. Discrepância entre agitação motora e relato de anergia ('o corpo não vai').",
  },
  {
    category: "Humor e Afeto",
    icon: HeartPulseIcon,
    finding:
      "Humor hipotímico. Afeto congruente, angustiado, com labilidade emocional",
    severity: "alert",
    detail:
      "Humor predominantemente deprimido ao longo de toda a entrevista. Afeto congruente com o humor, com expressão de angústia e desesperança. Episódios de choro durante o relato. Labilidade emocional presente — alternância entre apatia e crises de choro.",
  },
  {
    category: "Pensamento",
    icon: BrainIcon,
    finding:
      "Curso lentificado. Conteúdo com ideação de desvalia e desesperança",
    severity: "alert",
    detail:
      "Pensamento com curso lentificado, com latência aumentada nas respostas. Conteúdo marcado por ideação de desvalia ('eu tô um lixo', 'sou um peso') e desesperança ('a vida não vale a pena'). Sem ideação persecutória nesta consulta. Ruminações depressivas presentes.",
  },
  {
    category: "Sensopercepção",
    icon: EarIcon,
    finding:
      "Alucinações auditivas em remissão (presentes na consulta anterior)",
    severity: "attention",
    detail:
      "Paciente nega alucinações auditivas nesta consulta ('Pararam, doutor'). Na consulta anterior, relatava alucinações auditivas de comando. Manter vigilância para recidiva. Sem alucinações visuais, táteis ou outras.",
  },
  {
    category: "Atenção e Memória",
    icon: EyeIcon,
    finding:
      "Atenção hipotenaz com facilidade à dispersão. Memória imediata preservada",
    severity: "attention",
    detail:
      "Atenção voluntária diminuída — dificuldade em manter foco sustentado durante a entrevista. Memória imediata e recente aparentemente preservadas, porém memória de evocação prejudicada pelo estado afetivo atual.",
  },
  {
    category: "Consciência e Orientação",
    icon: SparklesIcon,
    finding: "Vigil, orientada auto e alopsiquicamente",
    severity: "normal",
    detail:
      "Nível de consciência preservado. Orientação temporal, espacial e pessoal mantidas. Sem alterações do campo de consciência.",
  },
  {
    category: "Juízo Crítico / Insight",
    icon: ShieldAlertIcon,
    finding: "Parcialmente preservado. Reconhece o sofrimento mas minimiza risco",
    severity: "attention",
    detail:
      "Paciente reconhece que está sofrendo, porém minimiza a gravidade da ideação ('eu sei que não deveria pensar assim'). Insight parcial sobre a doença. Aderência ao tratamento questionável — relata falhas na tomada da medicação.",
  },
];

const RISK_ASSESSMENT = {
  suicidio: {
    level: "moderado" as const,
    factors: [
      "Ideação de desesperança ativa ('a vida não vale a pena')",
      "Episódio depressivo grave atual",
      "Histórico de alucinações de comando (em remissão)",
      "Isolamento social relatado",
    ],
    protective: [
      "Vínculo terapêutico mantido — comparece às consultas",
      "Nega planejamento ou tentativa prévia",
      "Alucinações de comando em remissão",
      "Suporte familiar presente (mora com a mãe)",
    ],
  },
};

const CONDUTA: {
  text: string;
  done: boolean;
  priority: "alta" | "media" | "rotina";
}[] = [
  {
    text: "Manter Escitalopram 20mg/dia — avaliar resposta em 2 semanas",
    done: true,
    priority: "alta",
  },
  {
    text: "Adicionar Quetiapina 25mg à noite para insônia e agitação",
    done: true,
    priority: "alta",
  },
  {
    text: "Encaminhar para sessões ELAH — escuta terapêutica semanal",
    done: false,
    priority: "alta",
  },
  {
    text: "Solicitar exames laboratoriais (TSH, hemograma, função hepática)",
    done: false,
    priority: "media",
  },
  {
    text: "Contrato de segurança com paciente e familiar (mãe)",
    done: true,
    priority: "alta",
  },
  {
    text: "Retorno em 14 dias — monitorar ideação e resposta medicamentosa",
    done: false,
    priority: "alta",
  },
  {
    text: "Avaliar necessidade de psicoterapia estruturada (TCC)",
    done: false,
    priority: "media",
  },
];

const TIMELINE: TimelineEntry[] = [
  {
    date: "06/03/2026",
    type: "consulta",
    title: "Consulta atual — Retorno",
    detail: "Alucinações em remissão. Mantém humor deprimido e ideação de desesperança.",
  },
  {
    date: "20/02/2026",
    type: "consulta",
    title: "Consulta — Primeira avaliação",
    detail:
      "Quadro depressivo grave com alucinações auditivas de comando. Iniciado Escitalopram 20mg.",
  },
  {
    date: "15/02/2026",
    type: "evento",
    title: "Encaminhamento do clínico geral",
    detail: "Paciente encaminhada por quadro depressivo refratário a ISRS em dose baixa.",
  },
];

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function SeverityBadge({ severity }: { severity: ExamItem["severity"] }) {
  const config = {
    normal: {
      bg: "bg-[#2A9D8F]/10",
      text: "text-[#2A9D8F]",
      label: "Normal",
    },
    attention: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      label: "Atenção",
    },
    alert: {
      bg: "bg-[#B05A36]/10",
      text: "text-[#B05A36]",
      label: "Alerta",
    },
    critical: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      label: "Crítico",
    },
  };
  const c = config[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
        c.bg,
        c.text
      )}
    >
      {c.label}
    </span>
  );
}

function RiskLevel({ level }: { level: "baixo" | "moderado" | "alto" | "critico" }) {
  const config = {
    baixo: { color: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]", label: "Baixo", width: "w-1/4" },
    moderado: { color: "text-amber-600", bg: "bg-amber-500", label: "Moderado", width: "w-2/4" },
    alto: { color: "text-[#B05A36]", bg: "bg-[#B05A36]", label: "Alto", width: "w-3/4" },
    critico: { color: "text-red-600", bg: "bg-red-500", label: "Crítico", width: "w-full" },
  };
  const c = config[level];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Nível de risco
        </span>
        <span className={cn("text-sm font-semibold", c.color)}>{c.label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", c.bg, c.width)} />
      </div>
    </div>
  );
}

function ExamCard({
  item,
  index,
}: {
  item: ExamItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.76, 0, 0.24, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full rounded-xl border bg-card text-left transition-all duration-200",
          open ? "shadow-sm ring-1 ring-primary/10" : "hover:shadow-sm"
        )}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
              item.severity === "normal" && "bg-[#2A9D8F]/10 text-[#2A9D8F]",
              item.severity === "attention" && "bg-amber-500/10 text-amber-600",
              item.severity === "alert" && "bg-[#B05A36]/10 text-[#B05A36]",
              item.severity === "critical" && "bg-red-500/10 text-red-600"
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                {item.category}
              </span>
              <SeverityBadge severity={item.severity} />
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {item.finding}
            </p>
          </div>
          <ChevronDownIcon
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && item.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TranscriptQuote({
  speaker,
  text,
}: {
  speaker: "paciente" | "medico";
  text: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        speaker === "paciente" ? "justify-start" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          speaker === "paciente"
            ? "bg-secondary text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {speaker === "paciente" ? "P" : "M"}
      </div>
      <div
        className={cn(
          "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          speaker === "paciente"
            ? "bg-secondary text-foreground"
            : "bg-primary/5 text-foreground"
        )}
      >
        <span className={cn("italic", ptSerif.className)}>
          &ldquo;{text}&rdquo;
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PainelPacientePage() {
  return (
    <div
      className={cn(
        "theme-fh min-h-svh bg-background text-foreground",
        inter.className
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <CircleDotIcon className="size-5 text-primary" />
            <span className="text-lg font-semibold tracking-wide text-foreground">
              ELAH
            </span>
            <Separator orientation="vertical" className="h-5" />
            <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Saúde Mental · Família
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              GS
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">{PATIENT.medico}</span>
              <span className="text-[10px] text-muted-foreground">{PATIENT.especialidade}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* ---------------------------------------------------------------- */}
        {/* Patient header card                                              */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                AB
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {PATIENT.name}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {PATIENT.age} anos · Prontuário {PATIENT.prontuario}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#B05A36]/10 px-2.5 py-1 text-[11px] font-semibold text-[#B05A36]">
                    {PATIENT.cid}
                  </span>
                  <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Adulto
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground md:text-right">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" />
                {PATIENT.dataConsulta}
              </div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="size-3.5" />
                {PATIENT.horaConsulta} · {PATIENT.duracaoConsulta}
              </div>
              <div className="flex items-center gap-1.5">
                <MicIcon className="size-3.5" />
                {PATIENT.fonteAudio}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Grid layout                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ============================================================== */}
          {/* Left column — Main content (2/3)                               */}
          {/* ============================================================== */}
          <div className="space-y-6 lg:col-span-2">
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3"
            >
              <SparklesIcon className="size-4 text-primary" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">Análise gerada por IA</span>{" "}
                a partir da transcrição da consulta. Revise e valide antes de
                incorporar ao prontuário.
              </p>
            </motion.div>

            {/* Transcript excerpt */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <FileTextIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                  Trecho da Transcrição
                </h2>
              </div>
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <TranscriptQuote
                  speaker="paciente"
                  text={TRANSCRIPTION_EXCERPT.paciente}
                />
                <TranscriptQuote
                  speaker="medico"
                  text={TRANSCRIPTION_EXCERPT.medico}
                />
                <TranscriptQuote
                  speaker="paciente"
                  text={TRANSCRIPTION_EXCERPT.paciente2}
                />
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Ver transcrição completa
                  <ChevronRightIcon className="size-3" />
                </button>
              </div>
            </section>

            {/* Exame Psíquico */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainIcon className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                    Exame Psíquico
                  </h2>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {EXAME_PSIQUICO.length} domínios avaliados
                </span>
              </div>
              <div className="space-y-2">
                {EXAME_PSIQUICO.map((item, i) => (
                  <ExamCard key={item.category} item={item} index={i} />
                ))}
              </div>
            </section>

            {/* Conduta / Plan */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardListIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                  Conduta e Plano Terapêutico
                </h2>
              </div>
              <div className="rounded-xl border bg-card">
                <div className="divide-y">
                  {CONDUTA.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-[10px]",
                          item.done
                            ? "bg-[#2A9D8F] text-white"
                            : "border border-border"
                        )}
                      >
                        {item.done && <CheckCircle2Icon className="size-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm",
                            item.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {item.text}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                          item.priority === "alta" &&
                            "bg-[#B05A36]/10 text-[#B05A36]",
                          item.priority === "media" &&
                            "bg-amber-500/10 text-amber-600",
                          item.priority === "rotina" &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ============================================================== */}
          {/* Right column — Sidebar (1/3)                                   */}
          {/* ============================================================== */}
          <div className="space-y-6">
            {/* Risk assessment */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-foreground">
                  Avaliação de Risco — Suicídio
                </h3>
              </div>

              <RiskLevel level={RISK_ASSESSMENT.suicidio.level} />

              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#B05A36]">
                    Fatores de Risco
                  </p>
                  <ul className="space-y-1.5">
                    {RISK_ASSESSMENT.suicidio.factors.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground"
                      >
                        <XCircleIcon className="mt-0.5 size-3 shrink-0 text-[#B05A36]/60" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#2A9D8F]">
                    Fatores Protetores
                  </p>
                  <ul className="space-y-1.5">
                    {RISK_ASSESSMENT.suicidio.protective.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground"
                      >
                        <CheckCircle2Icon className="mt-0.5 size-3 shrink-0 text-[#2A9D8F]/60" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Medications */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <PillIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Medicações Atuais
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "Escitalopram",
                    dose: "20mg/dia",
                    status: "Manter",
                    note: "Uso contínuo — avaliar resposta em 14 dias",
                  },
                  {
                    name: "Quetiapina",
                    dose: "25mg/noite",
                    status: "Novo",
                    note: "Adicionada nesta consulta — insônia e agitação",
                  },
                ].map((med) => (
                  <div
                    key={med.name}
                    className="rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {med.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                          med.status === "Novo"
                            ? "bg-primary/10 text-primary"
                            : "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                        )}
                      >
                        {med.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {med.dose} — {med.note}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Linha do Tempo
                </h3>
              </div>
              <div className="space-y-0">
                {TIMELINE.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex size-2.5 shrink-0 rounded-full",
                          i === 0 ? "bg-primary" : "bg-border"
                        )}
                      />
                      {i < TIMELINE.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {entry.date}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      {entry.detail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {entry.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ELAH sessions card */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="rounded-xl border border-primary/15 bg-primary/5 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <EarIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">
                  Sessões ELAH
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Escuta terapêutica recomendada para dessensibilização da
                ansiedade clínica. Protocolo sugerido:{" "}
                <span className="font-medium text-foreground">
                  4 sessões semanais
                </span>
                .
              </p>
              <Button
                className="mt-3 h-9 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                Agendar Primeira Sessão
              </Button>
            </motion.section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t pt-6 pb-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            Análise gerada por IA a partir de transcrição via{" "}
            <span className="font-medium">{PATIENT.fonteAudio}</span>.
            Documento de apoio clínico — não substitui avaliação médica presencial.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <FileTextIcon className="size-3" />
              Exportar PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <ClipboardListIcon className="size-3" />
              Copiar para Prontuário
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
