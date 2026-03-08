import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("elah_auth")?.value === "1";

  // Protege o painel — redireciona para login se não autenticado
  if (pathname.startsWith("/painel-paciente-segrini")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login-fh", request.url));
    }
  }

  // Se já autenticado e tentar acessar o login, redireciona para o painel
  if (pathname.startsWith("/login-fh") && isAuthenticated) {
    return NextResponse.redirect(new URL("/painel-paciente-segrini", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel-paciente-segrini/:path*", "/login-fh"],
};
