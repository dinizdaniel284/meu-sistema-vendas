import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) {
      return NextResponse.json(
        { error: "O campo nicho não foi enviado." },
        { status: 400 }
      );
    }

    const prompt = `
Atue como um Especialista em Marketing Digital.
O usuário vende: ${nicho}.

Gere uma estratégia rápida com:
ESTRATÉGIA MATADORA,
LEGENDA,
DICA DE OURO.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content || "";

    await supabase.from("leads").insert([{ 
      email: email || null, 
      nicho, 
      ai_analysis: text, 
      model_used: "gpt-4o-mini"
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
