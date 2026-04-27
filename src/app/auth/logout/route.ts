import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function clearSupabaseCookies(response: NextResponse, cookieHeader: string | null) {
  if (!cookieHeader) return;

  const cookieNames = cookieHeader
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name.startsWith("sb-") || name.startsWith("supabase-auth-token"));

  cookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
    });
  });
}

async function handleLogout(request: Request) {
  const redirectUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(redirectUrl);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Nao foi possivel encerrar a sessao no servidor.", error);
  }

  clearSupabaseCookies(response, request.headers.get("cookie"));
  return response;
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}
