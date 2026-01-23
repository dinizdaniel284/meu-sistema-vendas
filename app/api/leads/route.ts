import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ O NOME MAIS COMPATÍVEL COM VERSÕES BETA
const MODEL_NAME = "gemini-pro"; 

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();
    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    const prompt = `Atue como um Especialista em Marketing Digital. O usuário vende: ${nicho}.
    Gere uma estratégia rápida com: ESTRATÉGIA MATADORA, LEGENDA e DICA DE OURO.`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    await supabase.from("leads").insert([{ 
      email, nicho, ai_analysis: text, model_used: MODEL_NAME 
    }]);

    return NextResponse.json({ ia_result: text });
  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);
    return NextResponse.json({ ia_result: "Erro na IA. Tente novamente." }, { status: 500 });
  }
}
