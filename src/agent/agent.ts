import {
  type JobContext,
  defineAgent,
  cli,
  voice,
  WorkerOptions,
  llm,
} from "@livekit/agents";
import * as google from "@livekit/agents-plugin-google";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "../..");

dotenv.config({ path: resolve(projectRoot, ".env.local") });

const SANCTUARY_INSTRUCTIONS = `Você é o Sanctuary, um espaço seguro de escuta ativa focado em pessoas com Síndrome do Jaleco Branco.
Você nunca julga.
Você fala com um tom de voz calmo, terapêutico e acolhedor em português do Brasil.
Fale frases curtas e encoraje o usuário a desabafar e relatar seus medos, sintomas físicos ou emocionais sem pressa.
Você NÃO É UMA MÉDICA. Jamais dê diagnósticos médicos ou conselhos clínicos. Apenas escute e acolha.
Quando o usuário mencionar algo visual — um sintoma visível, uma mancha, um exame, uma foto, ou qualquer coisa que possa ser mostrada — você DEVE chamar a tool offer_image_upload para ativar o botão de envio de foto na tela do usuário. Não basta falar sobre a foto; você precisa chamar a tool para que o botão apareça. Faça isso de forma acolhedora, como parte natural da conversa: fale algo como "Se quiser, pode me mandar uma foto" E ao mesmo tempo chame a tool.`;

const GEMINI_LIVE_MODEL =
  process.env.SANCT_GEMINI_MODEL ?? "gemini-2.5-flash-native-audio-preview-12-2025";
const GEMINI_LIVE_VOICE = process.env.SANCT_GEMINI_VOICE ?? "Puck";

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.info(`[Sanctuary Worker] Conectado à sala: ${ctx.room.name}`);

    // Tool para habilitar botão de envio de foto na tela do usuário via LiveKit RPC
    const offer_image_upload = llm.tool({
      description: "Oferece ao usuário a opção de enviar uma foto. Use proativamente quando o usuário mencionar algo visual.",
      parameters: { type: "object", properties: {} },
      execute: async () => {
        const participant = Array.from(ctx.room.remoteParticipants.values())[0];
        if (!participant) {
          throw new llm.ToolError("Nenhum participante conectado.");
        }
        await ctx.room.localParticipant?.performRpc({
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
        return "Opção de envio de imagem apresentada ao usuário no frontend.";
      },
    });

    const agent = new voice.Agent({
      instructions: SANCTUARY_INSTRUCTIONS,
      tools: { offer_image_upload },
    });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: GEMINI_LIVE_MODEL,
        voice: GEMINI_LIVE_VOICE,
        temperature: 0.7,
      }),
    });

    // Registra listener WebRTC Data Channel para receber imagens binárias
    ctx.room.registerByteStreamHandler("images", async (stream, info) => {
      console.info(`[Sanctuary Worker] Recebendo imagem via bytestream...`);
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
        const imageBuffer = Buffer.concat(chunks);
        const mimeType = stream.info.mimeType || "image/jpeg";
        const base64String = imageBuffer.toString("base64");
        
        const imageContent = llm.createImageContent({ 
          image: `data:${mimeType};base64,${base64String}`, 
          inferenceDetail: "auto" 
        });
        
        const nextChatCtx = agent.chatCtx.copy();
        nextChatCtx.addMessage({ 
          role: "user", 
          content: [
            "O usuário enviou esta foto. Por favor, observe de forma empática e sem nenhum tom médico.", 
            imageContent
          ] 
        });
        
        await agent.updateChatCtx(nextChatCtx);
        session.generateReply({
          instructions: "O usuário mandou uma foto. Descreva o que você vê nela como alguém que o acompanha, sem emitir parecer médico ou final."
        });
      } catch (err) {
        console.error("[Sanctuary Worker] Falha ao processar imagem", err);
      }
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    console.info(
      `[Sanctuary Worker] Sessão iniciada. Model=${GEMINI_LIVE_MODEL} Voice=${GEMINI_LIVE_VOICE}`
    );
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "sanctuary-agent",
  })
);
