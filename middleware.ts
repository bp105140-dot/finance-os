import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Recupera o usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- LÓGICA DE PROTEÇÃO DE ROTAS ---

  const isLoginPage = request.nextUrl.pathname === "/login";
  const isRedefinirPage = request.nextUrl.pathname === "/redefinir-senha";

  // Se o usuário NÃO está logado e tenta acessar uma página que NÃO é login nem redefinir
  if (!user && !isLoginPage && !isRedefinirPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se o usuário JÁ está logado e tenta ir para o login, manda para o dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Configura em quais caminhos o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files like logos)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
