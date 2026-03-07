import {
  type JobContext,
  defineAgent,
  getJobContext,
  cli,
  voice,
  llm,
  ServerOptions,
} from "@livekit/agents";
import * as google from "@livekit/agents-plugin-google";
import { type ByteStreamReader } from "@livekit/rtc-node";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../..");

dotenv.config({ path: resolve(projectRoot, ".env.local") });

const IMAGE_TOPIC = "images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const GEMINI_LIVE_MODEL =
  process.env.SANCT_GEMINI_MODEL ?? "gemini-2.5-flash-native-audio-preview-12-2025";
const GEMINI_LIVE_VOICE = process.env.SANCT_GEMINI_VOICE ?? "Puck";
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const SANCTUARY_INSTRUCTIONS = `Você é o Sanctuary, um espaço seguro de escuta ativa focado em pacientes com Síndrome do Jaleco Branco.
Você nunca julga.
Você fala com um tom de voz calmo, terapêutico e acolhedor em português do Brasil.
Fale frases curtas e encoraje o paciente a desabafar e relatar seus sintomas físicos ou emocionais sem pressa.
Não dê diagnósticos médicos.
Quando houver imagem, confirme recebimento, descreva com cautela o que observa, peça confirmação em ambiguidades e mantenha postura acolhedora sem linguagem clínica conclusiva.
Quando o usuário mencionar algo visual — um sintoma visível, uma mancha, um exame, uma foto, ou qualquer coisa que possa ser mostrada — você DEVE chamar a tool offer_image_upload para ativar o botão de envio de foto na tela do usuário. Não basta falar sobre a foto; você precisa chamar a tool para que o botão apareça. Faça isso de forma acolhedora, como parte natural da conversa: fale algo como "Se quiser, pode me mandar uma foto" E ao mesmo tempo chame a tool. Não espere o usuário pedir explicitamente.`;

function normalizeMimeType(mimeType: string | undefined): string {
  return (mimeType ?? "").trim().toLowerCase();
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function drainReader(reader: ByteStreamReader): Promise<void> {
  await reader.readAll();
}

async function readImageBuffer(reader: ByteStreamReader): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of reader) {
    totalBytes += chunk.byteLength;
    if (totalBytes > MAX_IMAGE_BYTES) {
      throw new Error(
        `Imagem excede o limite máximo de ${formatMegabytes(MAX_IMAGE_BYTES)}.`
      );
    }
    chunks.push(Buffer.from(chunk));
  }

  if (totalBytes === 0) {
    throw new Error("Imagem recebida vazia.");
  }

  return Buffer.concat(chunks, totalBytes);
}

class SanctuaryAgent extends voice.Agent {
  constructor() {
    super({
      instructions: SANCTUARY_INSTRUCTIONS,
      tools: {
        offer_image_upload: llm.tool({
          description:
            'Oferece ao usuário a opção de enviar uma foto. Use proativamente quando o usuário mencionar algo visual (sintoma visível, mancha, exame, resultado, algo que quer mostrar). Ofereça de forma natural e acolhedora como parte da conversa.',
          parameters: { type: "object", properties: {} },
          execute: async () => {
            const room = getJobContext().room;
            const participant = Array.from(
              room.remoteParticipants.values()
            )[0];

            if (!participant) {
              throw new llm.ToolError(
                "Nenhum participante conectado para receber a oferta."
              );
            }

            await room.localParticipant!.performRpc({
              destinationIdentity: participant.identity,
              method: "showImageUploadPrompt",
              payload: JSON.stringify({
                title: "Posso observar isso com você",
                message: "Se quiser, envie uma foto.",
                label: "Enviar foto",
                kind: "generic",
              }),
              responseTimeout: 5000,
            });

            return "Opção de envio de imagem apresentada ao usuário.";
          },
        }),
      },
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new SanctuaryAgent();

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: GEMINI_LIVE_MODEL,
        voice: GEMINI_LIVE_VOICE,
        temperature: 0.7,
      }),
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    let imageQueue = Promise.resolve();

    ctx.room.registerByteStreamHandler(IMAGE_TOPIC, (reader, participantInfo) => {
      imageQueue = imageQueue
        .then(async () => {
          const mimeType = normalizeMimeType(reader.info.mimeType);
          const declaredSize = reader.info.totalSize;

          if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
            await drainReader(reader);
            console.warn(
              `[images] tipo não suportado de ${participantInfo.identity}: ${mimeType || "desconhecido"}`
            );
            return;
          }

          if (declaredSize !== undefined && declaredSize > MAX_IMAGE_BYTES) {
            await drainReader(reader);
            console.warn(
              `[images] imagem rejeitada por tamanho de ${participantInfo.identity}: ${formatMegabytes(
                declaredSize
              )}`
            );
            return;
          }

          const imageBuffer = await readImageBuffer(reader);
          const dataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
          const nextChatCtx = agent.chatCtx.copy();

          nextChatCtx.addMessage({
            role: "user",
            content: [
              "O usuário enviou uma foto para análise acolhedora. Observe com cautela, peça confirmação em ambiguidades e não forneça diagnóstico.",
              llm.createImageContent({
                image: dataUrl,
                inferenceDetail: "auto",
                mimeType,
              }),
            ],
          });

          await agent.updateChatCtx(nextChatCtx);
          session.generateReply({
            instructions:
              "Responda em português-BR. Confirme que recebeu a imagem, descreva o que observa com cautela, peça confirmação quando houver ambiguidade e evite qualquer diagnóstico.",
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Falha desconhecida.";
          console.error(
            `[images] falha ao processar imagem de ${participantInfo.identity}: ${message}`
          );
        });
    });

    console.info(
      `[sanctuary-agent] Gemini Live model=${GEMINI_LIVE_MODEL} voice=${GEMINI_LIVE_VOICE}`
    );
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "sanctuary-agent",
  })
);
