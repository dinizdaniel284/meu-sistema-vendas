import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    // Se não veio código, volta pro login ou dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ Erro ao trocar code por sessão:", error.message);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_callback_failed`
      );
    }
  } catch (err) {
    console.error("❌ Erro inesperado no callback:", err);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=unexpected_callback_error`
    );
  }

  // ✅ Sucesso: redireciona para o dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}