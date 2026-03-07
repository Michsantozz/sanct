import { NextResponse } from "next/server";

const AUTH_EMAIL = process.env.AUTH_EMAIL ?? "dr.gustavo@elah.com.br";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? "elah2026";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (
    email?.toLowerCase().trim() !== AUTH_EMAIL.toLowerCase() ||
    password !== AUTH_PASSWORD
  ) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("elah_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });
  return response;
}
