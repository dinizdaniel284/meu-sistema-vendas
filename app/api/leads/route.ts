import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ⚠️ Em produção, prefira usar SERVICE_ROLE_KEY no backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LeadBody = {
  email?: string;
  nicho: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadBody;
    const { email, nicho } = body;

    if (!nicho) {
      return NextResponse.json(
        { error: "O campo nicho não foi enviado." },
        { status: 400 }
      );
    }

    // 🔑 Validação da API Key da Groq
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ ERRO: A GROQ_API_KEY não foi encontrada.");
      return NextResponse.json(
        { ia_result: "Configuração de API pendente no servidor." },
        { status: 500 }
      );
    }

    // 🧠 Prompt otimizado
    const prompt = `
Atue como um Especialista em Marketing Digital de Elite.
O usuário vende: ${nicho}.

Gere uma estratégia rápida no seguinte formato:
ESTRATÉGIA MATADORA: (descreva a estratégia de forma direta e luxuosa)
LEGENDA: (sugestão de legenda magnética)
DICA DE OURO: (um segredo de conversão de alto ticket)
    `.trim();

    // 🚀 Chamada para a API da Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
        }),
      }
    );

    const completion = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na Groq:", completion);
      throw new Error(completion.error?.message || "Erro na API da Groq");
    }

    const text: string =
      completion.choices?.[0]?.message?.content ||
      "Erro ao gerar estratégia.";

    // 💾 Salva no Supabase
    const { error: dbError } = await supabase.from("leads").insert([
      {
        email: email || null,
        nicho,
        ai_analysis: text,
        model_used: "llama-3.3-70b-versatile",
      },
    ]);

    if (dbError) {
      console.error("❌ Erro ao salvar lead no Supabase:", dbError);
    }

    return NextResponse.json({ ia_result: text });
  } catch (error: any) {
    console.error("❌ ERRO NA ROTA LEADS:", error?.message || error);
    return NextResponse.json(
      { ia_result: "IA temporariamente ocupada. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}