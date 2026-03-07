import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function GET() {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "Server misconfigured: missing LiveKit credentials." },
      { status: 500 }
    );
  }

  try {
    const participantIdentity = `patient-${crypto.randomUUID().slice(0, 8)}`;

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantIdentity,
    });

    token.addGrant({
      room: "SanctuaryRoom",
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
