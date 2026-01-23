import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ O NOME MAIS ESTÁVEL DE TODOS
const PRIMARY_MODEL = "gemini-1.5-flash"; 

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();
    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    const prompt = `Atue como um Especialista em Marketing Digital. O usuário vende: ${nicho}.
    Gere um plano de ação rápido:
    🎯 ESTRATÉGIA MATADORA: (2 frases)
    📱 LEGENDA PRONTA PARA POST: (com emojis e hashtags)
    💡 DICA DE OURO: (sacada de fechamento)`;

    // Tenta carregar o modelo de forma explícita
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    await supabase.from("leads").insert([{ 
      email, nicho, ai_analysis: text, model_used: PRIMARY_MODEL 
    }]);

    return NextResponse.json({ ia_result: text });
  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);
    // Se o 1.5-flash falhar por nome, ele tenta o apelido 'gemini-pro' que é padrão
    return NextResponse.json(
      { ia_result: "IA em ajuste. Tente novamente." },
      { status: 500 }
    );
  }
}
