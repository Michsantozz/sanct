import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PUBLIC = ["/login-fh", "/api/auth/login", "/api/auth/logout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("elah_auth")?.value === "1";

  // Permite arquivos estáticos e internos do Next.js
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Rotas públicas sempre liberadas
  if (ALLOWED_PUBLIC.some((p) => pathname.startsWith(p))) {
    // Se já autenticado e acessar login, manda pro painel
    if (pathname.startsWith("/login-fh") && isAuthenticated) {
      return NextResponse.redirect(new URL("/painel-paciente-segrini", request.url));
    }
    return NextResponse.next();
  }

  // Painel — só com autenticação
  if (pathname.startsWith("/painel-paciente-segrini")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login-fh", request.url));
    }
    return NextResponse.next();
  }

  // Qualquer outra rota → login
  return NextResponse.redirect(new URL("/login-fh", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
