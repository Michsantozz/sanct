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
  CircleDotIcon,
  ClipboardListIcon,
  ClockIcon,
  EarIcon,
  FileTextIcon,
  HeartPulseIcon,
  MicIcon,
  MoonIcon,
  PillIcon,
  ShieldAlertIcon,
  SparklesIcon,
  SunIcon,
  SunsetIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], style: ["italic", "normal"] });

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

interface Medicamento {
  nome: string;
  dose: string;
  novo?: boolean;
}

interface TurnoMedicacao {
  turno: "manha" | "tarde" | "noite";
  medicamentos: Medicamento[];
}

interface Escala {
  nome: string;
  pontuacao: number;
  maximo: number;
  interpretacao: string;
  nivel: "baixo" | "moderado" | "alto";
  texto: string;
}

interface Meta {
  texto: string;
  feita: boolean;
  motivo: string;
}

// ---------------------------------------------------------------------------
// Mock data — Dr. Gustavo Segrini · Paciente pediátrico
// ---------------------------------------------------------------------------

const PATIENT = {
  name: "João Pedro M.",
  age: 7,
  prontuario: "MF-2026-1103",
  cid: "F84.0 + F90.0 — TEA leve + TDAH predominantemente desatento",
  medico: "Dr. Gustavo Segrini",
  especialidade: "Médico de Família — Saúde Mental",
  crm: "CRM-ES 12.345",
  dataConsulta: "07 de Março, 2026",
  horaConsulta: "09:15",
  duracaoConsulta: "38 min",
  fonteAudio: "Noa Notes — gravação em consultório",
  responsavel: "Maria Aparecida M. (mãe)",
};

const RESUMO_ATENDIMENTO = `Hoje conversamos bastante sobre o Joãozinho e sobre como ele tem se saído na escola e em casa. A mãe contou que ele ainda tem dificuldade para prestar atenção nas aulas, mas que a professora já notou uma pequena melhora desde que começamos o tratamento.

Ajustamos os remédios dele para ajudar ainda mais na concentração e no comportamento. Também conversamos sobre a importância da rotina em casa — isso faz muita diferença para crianças como o João.

As metas abaixo foram combinadas com a família para o período até o retorno. Vamos juntos nessa!`;

const MEDICACOES_TURNO: TurnoMedicacao[] = [
  {
    turno: "manha",
    medicamentos: [
      { nome: "Lamotrigina", dose: "25mg" },
      { nome: "Atentah", dose: "18mg" },
      { nome: "Desve", dose: "50mg", novo: true },
    ],
  },
  {
    turno: "tarde",
    medicamentos: [],
  },
  {
    turno: "noite",
    medicamentos: [
      { nome: "Lamotrigina", dose: "25mg" },
      { nome: "Atensina", dose: "0.1mg", novo: true },
      { nome: "Quetiapina", dose: "50mg" },
    ],
  },
];

const ESCALAS: Escala[] = [
  {
    nome: "SNAP-26 — Desatenção",
    pontuacao: 20,
    maximo: 27,
    interpretacao: "Nível alto de desatenção",
    nivel: "alto",
    texto: "O Joãozinho apresenta um nível elevado de desatenção que pede cuidado especial na escola. As medicações atuais focam justamente em ajudar o cérebro dele a se concentrar melhor.",
  },
  {
    nome: "M-CHAT — Rastreio TEA",
    pontuacao: 8,
    maximo: 20,
    interpretacao: "Risco moderado — TEA confirmado",
    nivel: "moderado",
    texto: "O rastreio do TEA confirma características leves do espectro autista. Isso significa que o João tem jeitos próprios de aprender e se comunicar, e estamos ajustando o suporte para respeitar isso.",
  },
  {
    nome: "CARS — Severidade do TEA",
    pontuacao: 28,
    maximo: 60,
    interpretacao: "TEA leve",
    nivel: "baixo",
    texto: "O nível de autismo do João é considerado leve. Com o acompanhamento certo e a terapia, ele tem muito potencial para evoluir bem em todas as áreas.",
  },
];

const EXAME_PSIQUICO: ExamItem[] = [
  {
    category: "Apresentação / Atitude",
    icon: UserIcon,
    finding: "Agitado, pouco contato visual, explorou o consultório",
    severity: "attention",
    detail: "Criança entrou no consultório com hiperatividade motora evidente, explorando os objetos da sala. Contato visual intermitente. Colaborativo quando engajado com brinquedo. Responsável (mãe) presente e participativa.",
  },
  {
    category: "Atenção e Concentração",
    icon: BrainIcon,
    finding: "Atenção hipotenaz, facilmente distraído por estímulos externos",
    severity: "alert",
    detail: "Dificuldade significativa em manter atenção durante a entrevista. Necessitou de redirecionamento frequente. Professora relatou (via mãe) dificuldade em copiar da lousa e seguir instruções em sala.",
  },
  {
    category: "Humor e Afeto",
    icon: HeartPulseIcon,
    finding: "Humor eutímico com episódios de irritabilidade quando contrariado",
    severity: "attention",
    detail: "Humor basal estável, porém com baixa tolerância à frustração. Episódios de birra intensa relatados pela mãe ao negar pedidos. Afeto congruente, expressivo.",
  },
  {
    category: "Linguagem e Comunicação",
    icon: EarIcon,
    finding: "Linguagem presente, com ecolalia ocasional e dificuldade pragmática",
    severity: "attention",
    detail: "Linguagem oral presente com vocabulário adequado para a idade. Ecolalia funcional ocasional. Dificuldade em conversas recíprocas — tende a falar em monólogos sobre seus interesses (dinossauros).",
  },
  {
    category: "Psicomotricidade",
    icon: ActivityIcon,
    finding: "Hiperatividade motora, movimentos repetitivos (flapping)",
    severity: "attention",
    detail: "Agitação motora difusa durante toda a consulta. Movimentos de flapping com as mãos em momentos de excitação. Coordenação motora fina levemente prejudicada (relatada pela terapeuta ocupacional).",
  },
  {
    category: "Interação Social",
    icon: ShieldAlertIcon,
    finding: "Preferência por atividade solitária, contato social seletivo",
    severity: "attention",
    detail: "Prefere brincar sozinho ou com adultos. Dificuldade em compartilhar brinquedos e em jogos cooperativos com pares. Tem um amigo preferencial na escola (relatado pela mãe como positivo).",
  },
];

const METAS: Meta[] = [
  { texto: "Dar o remédio da manhã antes do café, todo dia no mesmo horário", feita: false, motivo: "Regularidade ajuda o efeito da medicação a ser mais constante" },
  { texto: "Criar uma rotina visual (quadro de figuras) para as atividades do dia", feita: false, motivo: "Crianças com TEA respondem muito bem à previsibilidade" },
  { texto: "Limitar o tempo de tela para no máximo 1h por dia", feita: false, motivo: "Excesso de tela piora a desatenção e a irritabilidade" },
  { texto: "Garantir que o João durma às 21h — sem exceções", feita: false, motivo: "O sono é essencial para que os remédios façam efeito" },
  { texto: "Levar o relatório da escola na próxima consulta", feita: false, motivo: "Precisamos saber como está o comportamento em sala de aula" },
  { texto: "Agendar avaliação com a fonoaudióloga", feita: false, motivo: "A comunicação do João precisa de suporte especializado" },
];

const ALERTAS = [
  {
    titulo: "Desve (50mg) — Primeiros dias",
    texto: "É normal sentir um pouco de enjoo ou falta de apetite nos primeiros 5 a 7 dias. Dê sempre depois do café da manhã. Se ele não quiser comer, não force — ofereça algo leve.",
    cor: "amber",
  },
  {
    titulo: "Atensina (0.1mg) — Pode dar soninho à noite",
    texto: "Esse remédio pode deixar o João um pouco mais sonolento logo depois de tomar. É esperado e ajuda a dormir melhor. Se o sono ficar muito pesado, avise a clínica.",
    cor: "primary",
  },
];

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function SeverityBadge({ severity }: { severity: ExamItem["severity"] }) {
  const config = {
    normal: { bg: "bg-[#2A9D8F]/10", text: "text-[#2A9D8F]", label: "Normal" },
    attention: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Atenção" },
    alert: { bg: "bg-[#B05A36]/10", text: "text-[#B05A36]", label: "Alerta" },
    critical: { bg: "bg-red-500/10", text: "text-red-600", label: "Crítico" },
  };
  const c = config[severity];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

function ExamCard({ item, index }: { item: ExamItem; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.05, ease: [0.76, 0, 0.24, 1] }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("w-full rounded-xl border bg-card text-left transition-all duration-200", open ? "shadow-sm ring-1 ring-primary/10" : "hover:shadow-sm")}
      >
        <div className="flex items-start gap-3 px-3 py-3 md:px-4 md:py-3.5">
          <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg md:size-8",
            item.severity === "normal" && "bg-[#2A9D8F]/10 text-[#2A9D8F]",
            item.severity === "attention" && "bg-amber-500/10 text-amber-600",
            item.severity === "alert" && "bg-[#B05A36]/10 text-[#B05A36]",
            item.severity === "critical" && "bg-red-500/10 text-red-600"
          )}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">{item.category}</span>
              <SeverityBadge severity={item.severity} />
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">{item.finding}</p>
          </div>
          <ChevronDownIcon className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>
      <AnimatePresence>
        {open && item.detail && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResumoAtendimento() {
  const [open, setOpen] = useState(false);
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
      <div className="mb-3 flex items-center gap-2">
        <FileTextIcon className="size-4 text-primary" />
        <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase text-foreground">Resumo do seu Atendimento</h2>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Texto com peek quando fechado */}
        <div className="relative px-5 pt-5">
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]",
              open ? "max-h-[600px]" : "max-h-[96px]"
            )}
          >
            <p className={cn("text-base leading-relaxed text-foreground/90", ptSerif.className)} style={{ fontStyle: "italic" }}>
              {RESUMO_ATENDIMENTO}
            </p>
            {open && (
              <div className="mt-4 flex items-center gap-2 border-t pt-4 pb-1">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">GS</div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{PATIENT.medico}</p>
                  <p className="text-[10px] text-muted-foreground">{PATIENT.especialidade} · {PATIENT.dataConsulta}</p>
                </div>
              </div>
            )}
          </div>

          {/* Fade overlay quando fechado */}
          {!open && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>

        {/* Botão expandir */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-center gap-1.5 border-t bg-secondary/40 px-5 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
        >
          {open ? "Fechar resumo" : "Ler resumo completo"}
          <ChevronDownIcon className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>
    </motion.section>
  );
}

function MedicacaoTurno({ turno }: { turno: TurnoMedicacao }) {
  const config = {
    manha: { icon: SunIcon, label: "Manhã", cor: "text-[#B05A36]", bg: "bg-card border-[#B05A36]/20", iconBg: "bg-[#B05A36]/10", accent: "border-l-4 border-l-[#B05A36]/50" },
    tarde: { icon: SunsetIcon, label: "Tarde", cor: "text-muted-foreground", bg: "bg-secondary/60 border-border", iconBg: "bg-background", accent: "border-l-4 border-l-border" },
    noite: { icon: MoonIcon, label: "Noite", cor: "text-[#2A9D8F]", bg: "bg-card border-[#2A9D8F]/20", iconBg: "bg-[#2A9D8F]/10", accent: "border-l-4 border-l-[#2A9D8F]/50" },
  };
  const c = config[turno.turno];
  const Icon = c.icon;

  return (
    <div className={cn("flex-1 rounded-xl border p-3 md:p-4", c.bg, c.accent)}>
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("flex size-7 items-center justify-center rounded-lg", c.iconBg)}>
          <Icon className={cn("size-4", c.cor)} />
        </div>
        <span className={cn("text-sm font-semibold", c.cor)}>{c.label}</span>
      </div>
      {turno.medicamentos.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nenhum remédio neste período</p>
      ) : (
        <div className="space-y-2">
          {turno.medicamentos.map((med) => (
            <div key={med.nome} className="flex items-start justify-between gap-1">
              <div>
                <p className="text-sm font-medium text-foreground leading-tight">{med.nome}</p>
                <p className="text-xs text-muted-foreground">{med.dose}</p>
              </div>
              {med.novo && (
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Novo</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EscalaBar({ escala }: { escala: Escala }) {
  const pct = Math.round((escala.pontuacao / escala.maximo) * 100);
  const cor = {
    baixo: { bar: "bg-[#2A9D8F]", text: "text-[#2A9D8F]", bg: "bg-[#2A9D8F]/10" },
    moderado: { bar: "bg-[#B05A36]/70", text: "text-[#B05A36]", bg: "bg-secondary" },
    alto: { bar: "bg-[#B05A36]", text: "text-[#B05A36]", bg: "bg-[#B05A36]/10" },
  }[escala.nivel];

  return (
    <div className={cn("rounded-xl border p-4", cor.bg)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{escala.nome}</span>
        <span className={cn("text-xs font-bold", cor.text)}>{escala.pontuacao}/{escala.maximo}</span>
      </div>
      <div className="mb-1 h-2 overflow-hidden rounded-full bg-background/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className={cn("h-full rounded-full", cor.bar)}
        />
      </div>
      <div className="mb-2 flex justify-between">
        <span className="text-[10px] text-muted-foreground">{escala.interpretacao}</span>
        <span className="text-[10px] font-semibold text-muted-foreground">{pct}%</span>
      </div>
      <p className="text-xs leading-relaxed text-foreground/80 italic">{escala.texto}</p>
    </div>
  );
}

function MetaItem({ meta, index }: { meta: Meta; index: number }) {
  const [feita, setFeita] = useState(meta.feita);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
      className={cn("flex items-start gap-3 rounded-xl border px-3 py-3 transition-all", feita ? "bg-[#2A9D8F]/5 border-[#2A9D8F]/20" : "bg-card")}
    >
      <button
        type="button"
        onClick={() => setFeita(!feita)}
        className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded transition-all", feita ? "bg-[#2A9D8F] text-white" : "border-2 border-border hover:border-primary")}
      >
        {feita && <CheckCircle2Icon className="size-3" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-snug", feita && "line-through text-muted-foreground")}>{meta.texto}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{meta.motivo}</p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PainelPacienteSegriniPage() {
  return (
    <div className={cn("theme-fh min-h-svh bg-background text-foreground", inter.className)}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <CircleDotIcon className="size-4 text-primary md:size-5" />
            <span className="text-base font-semibold tracking-wide text-foreground md:text-lg">ELAH</span>
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground md:inline-flex">
              Saúde Mental · Família
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground md:size-8">GS</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground md:text-sm">{PATIENT.medico}</span>
              <span className="hidden text-[10px] text-muted-foreground md:block">{PATIENT.especialidade}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-8">

        {/* Patient card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }} className="rounded-2xl border bg-card p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6">
          {/* Top row: avatar + info */}
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary md:size-14 md:text-lg">JP</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground md:text-xl">{PATIENT.name}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{PATIENT.age} anos · Prontuário {PATIENT.prontuario}</p>
              <p className="text-xs text-muted-foreground">Responsável: {PATIENT.responsavel}</p>
            </div>
          </div>
          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#B05A36]/10 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-widest uppercase text-[#B05A36]">{PATIENT.cid}</span>
            <span className="rounded-lg bg-secondary px-2.5 py-1 text-[0.6875rem] font-semibold tracking-widest uppercase text-muted-foreground">Pediátrico</span>
          </div>
          {/* Meta info */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><CalendarIcon className="size-3.5" />{PATIENT.dataConsulta}</div>
            <div className="flex items-center gap-1.5"><ClockIcon className="size-3.5" />{PATIENT.horaConsulta} · {PATIENT.duracaoConsulta}</div>
            <div className="flex items-center gap-1.5"><MicIcon className="size-3.5" />{PATIENT.fonteAudio}</div>
          </div>
        </motion.div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* AI badge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
              <SparklesIcon className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">Análise gerada por IA</span> a partir da transcrição da consulta. Revise e valide antes de incorporar ao prontuário.
              </p>
            </motion.div>

            {/* ── 3. Resumo do Atendimento ──────────────────────────────── */}
            <ResumoAtendimento />

            {/* ── 5. Alertas / Red Flags ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-amber-500" />
                <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase text-foreground">Atenção com os Remédios Novos</h2>
              </div>
              <div className="space-y-3">
                {ALERTAS.map((alerta, i) => (
                  <div
                    key={i}
                    className={cn("flex gap-3 rounded-xl border p-4", alerta.cor === "amber" ? "border-border bg-secondary" : "border-primary/20 bg-primary/5")}
                  >
                    <AlertTriangleIcon className={cn("mt-0.5 size-4 shrink-0", alerta.cor === "amber" ? "text-[#B05A36]" : "text-primary")} />
                    <div>
                      <p className={cn("text-sm font-semibold", alerta.cor === "amber" ? "text-[#B05A36]" : "text-primary")}>{alerta.titulo}</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">{alerta.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* ── 1. Rotina de Medicamentos ─────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
              <div className="mb-3 flex items-center gap-2">
                <PillIcon className="size-4 text-primary" />
                <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase text-foreground">Rotina de Medicamentos</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MEDICACOES_TURNO.map((turno) => (
                  <MedicacaoTurno key={turno.turno} turno={turno} />
                ))}
              </div>
            </motion.section>

            {/* ── 2. Escalas Clínicas ───────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
              <div className="mb-3 flex items-center gap-2">
                <ActivityIcon className="size-4 text-primary" />
                <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase text-foreground">Escalas Avaliativas</h2>
              </div>
              <div className="space-y-3">
                {ESCALAS.map((escala, i) => (
                  <EscalaBar key={i} escala={escala} />
                ))}
              </div>
            </motion.section>

            {/* ── Exame Psíquico ────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainIcon className="size-4 text-primary" />
                  <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase text-foreground">Exame Psíquico</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">{EXAME_PSIQUICO.length} domínios</span>
              </div>
              <div className="space-y-2">
                {EXAME_PSIQUICO.map((item, i) => <ExamCard key={item.category} item={item} index={i} />)}
              </div>
            </motion.section>

          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* ── 4. Metas até o Retorno ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="rounded-xl border bg-card p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardListIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Suas Metas até o Retorno</h3>
              </div>
              <div className="space-y-2">
                {METAS.map((meta, i) => <MetaItem key={i} meta={meta} index={i} />)}
              </div>
              <p className="mt-3 text-center text-[10px] text-muted-foreground">Toque para marcar como feito ✓</p>
            </motion.section>

            {/* Próxima consulta */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }} className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <EarIcon className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">Sessões ELAH</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Sessões de escuta terapêutica recomendadas para o João e para apoio à família.
                Protocolo sugerido: <span className="font-medium text-foreground">sessões semanais por 4 semanas</span>.
              </p>
              <Button className="mt-3 h-9 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90" size="sm">
                Agendar Primeira Sessão
              </Button>
            </motion.section>

            {/* Retorno */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="rounded-xl border bg-card p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <CalendarIcon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próximo retorno</p>
                  <p className="text-sm font-semibold text-foreground">21 de Março, 2026</p>
                  <p className="text-[11px] text-muted-foreground">em 14 dias · Dr. Gustavo</p>
                </div>
              </div>
            </motion.section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2 border-t pt-5 pb-8 text-center md:mt-10 md:pt-6">
          <p className="text-[11px] text-muted-foreground">
            Análise gerada por IA a partir de transcrição via <span className="font-medium">{PATIENT.fonteAudio}</span>. Documento de apoio clínico — não substitui avaliação médica presencial.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground">
              <FileTextIcon className="size-3" /> Exportar PDF
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground">
              <ClipboardListIcon className="size-3" /> Copiar para Prontuário
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}
