import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ NOMES PADRONIZADOS PARA EVITAR 404 E 429
const PRIMARY_MODEL = "gemini-1.5-flash"; 
const FALLBACK_MODEL = "gemini-1.5-flash-8b";

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();
    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    let text = "";
    let modelUsed = PRIMARY_MODEL;

    const prompt = `Atue como um Especialista em Marketing Digital. O usuário vende: ${nicho}.
    Gere um plano de ação seguindo este formato:
    🎯 ESTRATÉGIA MATADORA: (2 frases)
    📱 LEGENDA PRONTA PARA POST: (com emojis e hashtags)
    💡 DICA DE OURO: (sacada de fechamento)`;

    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (primaryError) {
      console.warn("⚠️ Usando fallback...", primaryError);
      const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      text = fallbackResult.response.text();
      modelUsed = FALLBACK_MODEL;
    }

    await supabase.from("leads").insert([{ 
      email, nicho, ai_analysis: text, model_used: modelUsed 
    }]);

    return NextResponse.json({ ia_result: text, model_used: modelUsed });
  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);
    return NextResponse.json(
      { ia_result: "IA em alta demanda. Tente em 30 segundos." },
      { status: 500 }
    );
  }
}
