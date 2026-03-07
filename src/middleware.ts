import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login-fh"];
const PROTECTED_PATHS = ["/painel-paciente", "/painel-paciente-segrini"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("elah_auth");

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Já autenticado tentando acessar login → manda pro painel
  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL("/painel-paciente-segrini", request.url));
  }

  // Rota protegida sem autenticação → manda pro login
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login-fh", request.url));
  }

  // Qualquer outra rota não mapeada → redireciona para login ou painel
  if (!isPublic && !isProtected) {
    const target = isAuthenticated ? "/painel-paciente-segrini" : "/login-fh";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
