"use client";

import { useRef, useEffect } from "react";
import { Inter, PT_Serif } from "next/font/google";
import { motion } from "motion/react";
import {
  ArrowUpIcon,
  BrainIcon,
  CheckIcon,
  CircleDotIcon,
  ClipboardListIcon,
  Loader2Icon,
  SearchIcon,
  StethoscopeIcon,
  WrenchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactContent,
} from "@/components/ai-elements/artifact";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic", "normal"],
});

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

// Easing removed — used inline in transition

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type MockBlock =
  | { type: "user"; content: string }
  | { type: "assistant"; content: string }
  | { type: "reasoning"; content: string; duration: number }
  | { type: "tool_call"; name: string; status: "completed" | "running" | "error"; duration?: string }
  | { type: "chain_of_thought"; steps: { label: string; detail: string; done: boolean }[] }
  | { type: "task_plan"; title: string; tasks: { text: string; done: boolean }[] };

const MOCK_CONVERSATION: MockBlock[] = [
  {
    type: "user",
    content:
      "Paciente feminina, 42 anos, apresenta pressão arterial elevada em consultórios mas normal em casa. Histórico de ansiedade em ambientes clínicos. Última PA em consultório: 152/96 mmHg. PA domiciliar média: 122/78 mmHg.",
  },
  {
    type: "reasoning",
    content:
      "A paciente apresenta um padrão clássico de **Síndrome do Jaleco Branco** (White Coat Syndrome). A diferença entre PA clínica (152/96) e PA domiciliar (122/78) é significativa — acima do limiar de 20/10 mmHg que caracteriza o efeito do jaleco branco.\n\nPreciso considerar:\n- Descartar hipertensão mascarada reversa\n- Avaliar dados de MAPA (Monitorização Ambulatorial da Pressão Arterial)\n- Verificar medicamentos atuais e possíveis interações\n- Fatores psicológicos: ansiedade clínica pode ser gatilho para resposta simpática exacerbada\n- Biomarcadores de estresse crônico (cortisol, PCR)",
    duration: 8,
  },
  {
    type: "tool_call",
    name: "buscar_historico_mapa",
    status: "completed",
    duration: "1.2s",
  },
  {
    type: "tool_call",
    name: "analisar_medicamentos",
    status: "completed",
    duration: "0.8s",
  },
  {
    type: "tool_call",
    name: "consultar_biomarcadores",
    status: "completed",
    duration: "2.1s",
  },
  {
    type: "chain_of_thought",
    steps: [
      {
        label: "Revisão do MAPA",
        detail: "Dados de 24h confirmam PA normal fora do consultório (média diurna 118/74)",
        done: true,
      },
      {
        label: "Análise farmacológica",
        detail: "Sem medicações anti-hipertensivas ativas. Uso de escitalopram 10mg (ansiedade)",
        done: true,
      },
      {
        label: "Avaliação de biomarcadores",
        detail: "Cortisol sérico no limite superior (18.2 μg/dL). PCR normal.",
        done: true,
      },
      {
        label: "Plano terapêutico",
        detail: "Elaborando recomendações personalizadas com foco em desensibilização",
        done: true,
      },
    ],
  },
  {
    type: "assistant",
    content: `## Avaliação Clínica

Com base nos dados analisados, a paciente apresenta **Síndrome do Jaleco Branco confirmada**, sem evidência de hipertensão sustentada.

### Evidências

| Parâmetro | Valor | Referência |
|-----------|-------|-----------|
| PA consultório | 152/96 mmHg | < 140/90 |
| PA domiciliar | 122/78 mmHg | < 135/85 |
| MAPA diurna | 118/74 mmHg | < 135/85 |
| Cortisol sérico | 18.2 μg/dL | 6-23 μg/dL |

### Recomendações

1. **Monitorização domiciliar** — Manter diário de PA com protocolo 7 dias (manhã e noite), antes do próximo retorno
2. **Sessões com ELAH** — Iniciar programa de escuta terapêutica para redução de ansiedade clínica. Protocolo de 4 sessões, foco em dessensibilização progressiva ao ambiente médico
3. **Técnicas de respiração** — Exercício 4-7-8 antes de consultas presenciais
4. **Reavaliação** — Em 30 dias com novo MAPA de controle
5. **Cortisol** — Monitorar na reavaliação (limite superior atual pode indicar estresse crônico subclínico)

> **Nota:** Não há indicação de terapia anti-hipertensiva neste momento. O manejo deve focar na causa raiz — a resposta ansiosa ao ambiente clínico.`,
  },
  {
    type: "task_plan",
    title: "Plano de Acompanhamento — 30 dias",
    tasks: [
      { text: "Agendar MAPA de controle em 30 dias", done: false },
      { text: "Iniciar sessões ELAH (voz terapêutica) — 4 sessões", done: true },
      { text: "Entregar protocolo de PA domiciliar (7 dias)", done: true },
      { text: "Revisão de ansiedade com escala GAD-7", done: false },
      { text: "Dosagem de cortisol sérico de controle", done: false },
      { text: "Retorno presencial com técnica de relaxamento pré-consulta", done: false },
    ],
  },
  {
    type: "user",
    content: "E se a PA domiciliar dela começar a subir também? Qual seria o threshold para iniciar medicação?",
  },
  {
    type: "reasoning",
    content:
      "Boa pergunta do médico. Preciso diferenciar entre:\n- Evolução para hipertensão mascarada (PA alta em casa, normal no consultório)\n- Evolução para hipertensão sustentada (PA alta em ambos os contextos)\n\nO threshold para iniciar medicação depende do risco cardiovascular global e das comorbidades.",
    duration: 4,
  },
  {
    type: "assistant",
    content: `### Critérios para Iniciar Medicação

Se a PA domiciliar ultrapassar **135/85 mmHg** de forma sustentada (média de 7 dias), considerar:

1. **Risco baixo-moderado** (sem LOA, sem DM, sem DRC): observar por mais 3 meses com mudanças de estilo de vida
2. **Risco alto** (LOA presente, DM, DRC): iniciar monoterapia — preferência por **IECA ou BRA** dado o perfil ansiogênico da paciente (evitar betabloqueadores que podem mascarar sintomas)

O ponto crítico seria PA domiciliar consistentemente **≥ 140/90 mmHg** ou evidência de lesão em órgão-alvo no MAPA.

> Recomendo manter o foco na abordagem não-farmacológica pelos próximos 30 dias, dado que os dados atuais não sustentam hipertensão verdadeira.`,
  },
];

// ---------------------------------------------------------------------------
// Inline components
// ---------------------------------------------------------------------------

function ToolCallIndicator({
  name,
  status,
  duration,
}: {
  name: string;
  status: "completed" | "running" | "error";
  duration?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs">
      <WrenchIcon className="size-3.5 text-muted-foreground" />
      <span className="font-mono font-semibold tracking-wider text-foreground">
        {name}
      </span>
      <Separator orientation="vertical" className="h-3" />
      <span
        className={cn(
          "flex items-center gap-1 font-medium",
          status === "completed" && "text-[#2A9D8F]",
          status === "running" && "text-primary",
          status === "error" && "text-destructive"
        )}
      >
        {status === "completed" && <CheckIcon className="size-3" />}
        {status === "running" && (
          <Loader2Icon className="size-3 animate-spin" />
        )}
        {status === "completed"
          ? "Concluído"
          : status === "running"
            ? "Executando..."
            : "Erro"}
      </span>
      {duration && (
        <span className="text-muted-foreground">{duration}</span>
      )}
    </div>
  );
}

function ChainOfThought({
  steps,
}: {
  steps: { label: string; detail: string; done: boolean }[];
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        <SearchIcon className="size-3.5" />
        Cadeia de raciocínio
      </div>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  step.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {step.done ? (
                  <CheckIcon className="size-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-foreground">
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskPlan({
  title,
  tasks,
}: {
  title: string;
  tasks: { text: string; done: boolean }[];
}) {
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <Artifact>
      <ArtifactHeader>
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="size-4 text-primary" />
          <ArtifactTitle>{title}</ArtifactTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </ArtifactHeader>
      <ArtifactContent>
        <ul className="space-y-2.5">
          {tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
                  task.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}
              >
                {task.done && <CheckIcon className="size-2.5" />}
              </span>
              <span
                className={cn(
                  task.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      </ArtifactContent>
    </Artifact>
  );
}

function PromptInput() {
  return (
    <div className="border-t bg-background/80 px-4 pb-6 pt-4 backdrop-blur-sm md:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Descreva os sintomas do paciente..."
            className="h-12 rounded-full border-border bg-card pl-5 pr-14 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-primary"
            readOnly
          />
        </div>
        <Button
          className="size-12 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          size="icon-lg"
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Dados simulados para demonstração de interface — ELAH Painel Médico
      </p>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CircleDotIcon className="size-5 text-primary" />
            <span className="text-lg font-semibold tracking-wide text-foreground">
              ELAH
            </span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Painel Médico
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground md:block">
            Dra. Mariana Costa
          </span>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            MC
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Message block renderer
// ---------------------------------------------------------------------------

function MessageBlock({ block, index }: { block: MockBlock; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      {block.type === "user" && (
        <Message from="user">
          <MessageContent>{block.content}</MessageContent>
        </Message>
      )}

      {block.type === "reasoning" && (
        <Reasoning defaultOpen={true} duration={block.duration}>
          <ReasoningTrigger
            getThinkingMessage={(_streaming, duration) => {
              if (duration === undefined) return <p>Analisando...</p>;
              return <p>Analisou por {duration} segundos</p>;
            }}
          />
          <ReasoningContent>{block.content}</ReasoningContent>
        </Reasoning>
      )}

      {block.type === "tool_call" && (
        <ToolCallIndicator
          name={block.name}
          status={block.status}
          duration={block.duration}
        />
      )}

      {block.type === "chain_of_thought" && (
        <ChainOfThought steps={block.steps} />
      )}

      {block.type === "assistant" && (
        <Message from="assistant">
          <MessageContent>
            <MessageResponse>{block.content}</MessageResponse>
          </MessageContent>
        </Message>
      )}

      {block.type === "task_plan" && (
        <TaskPlan title={block.title} tasks={block.tasks} />
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DoctorChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      className={cn(
        "theme-fh min-h-svh bg-background text-foreground",
        inter.className
      )}
    >
      <Header />

      <main className="mx-auto flex h-[calc(100svh-64px)] max-w-3xl flex-col">
        {/* Conversation thread */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto px-4 py-8 md:px-6"
        >
          {/* Date badge */}
          <div className="flex justify-center">
            <span className="rounded-full bg-secondary px-4 py-1.5 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
              Hoje — 06 de Março, 2026
            </span>
          </div>

          {/* Conversation context card */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary">
              <StethoscopeIcon className="size-3.5" />
              Contexto da Consulta
            </div>
            <p className="mt-2 text-sm text-foreground">
              Avaliação de hipertensão situacional com suspeita de{" "}
              <em className={cn("text-primary", ptSerif.className)}>
                Síndrome do Jaleco Branco
              </em>
            </p>
          </div>

          {/* Messages */}
          {MOCK_CONVERSATION.map((block, i) => (
            <MessageBlock key={i} block={block} index={i} />
          ))}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>

        {/* Input */}
        <PromptInput />
      </main>
    </div>
  );
}
