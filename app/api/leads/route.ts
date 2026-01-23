import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ NOME TÉCNICO OFICIAL PARA EVITAR 404
const PRIMARY_MODEL = "gemini-1.5-flash-latest"; 

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();
    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    const prompt = `Atue como um Especialista em Marketing Digital. O usuário vende: ${nicho}.
    Gere um plano de ação rápido:
    🎯 ESTRATÉGIA MATADORA: (2 frases)
    📱 LEGENDA PRONTA PARA POST: (com emojis e hashtags)
    💡 DICA DE OURO: (sacada de fechamento)`;

    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    await supabase.from("leads").insert([{ 
      email, nicho, ai_analysis: text, model_used: PRIMARY_MODEL 
    }]);

    return NextResponse.json({ ia_result: text, model_used: PRIMARY_MODEL });
  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);
    return NextResponse.json(
      { ia_result: "IA em alta demanda. Tente em 30 segundos." },
      { status: 500 }
    );
  }
}
  
