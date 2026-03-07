import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/painel-paciente" || pathname.startsWith("/painel-paciente/")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/painel-paciente", request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
