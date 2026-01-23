import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

// ✅ ÚNICO MODELO LIBERADO NA TUA CHAVE
const MODEL_NAME = "models/gemini-1.0-pro";

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) {
      return NextResponse.json(
        { error: "O campo nicho não foi enviado." },
        { status: 400 }
      );
    }

    const prompt = `Atue como um Especialista em Marketing Digital. 
O usuário vende: ${nicho}.
Gere uma estratégia rápida com: 
ESTRATÉGIA MATADORA, 
LEGENDA 
e DICA DE OURO.`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    await supabase.from("leads").insert([{ 
      email: email || null, 
      nicho, 
      ai_analysis: text, 
      model_used: MODEL_NAME 
    }]);

    return NextResponse.json({ ia_result: text });

  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);
    return NextResponse.json(
      { ia_result: "Erro na IA. Tente novamente." },
      { status: 500 }
    );
  }
}
