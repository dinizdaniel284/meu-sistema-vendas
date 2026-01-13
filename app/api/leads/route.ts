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

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    // ✅ Modelo disponível e estável
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash"
    });

    const prompt = `
O usuário vende ${nicho}.
Crie uma estratégia curta de vendas, com no máximo 3 frases,
persuasiva e prática, para ele atrair clientes hoje.
Use gatilhos mentais mas sem promessas irreais.
Português do Brasil.
`;

    // ✅ Forma correta de chamar generateContent
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt }
          ]
        }
      ]
    });

    const text = result.response.text();

    // ✅ Inserir no Supabase
    const { error } = await supabase
      .from("leads")
      .insert([{ email, nicho, ai_analysis: text }]);

    if (error) throw error;

    return NextResponse.json({ ia_result: text });

  } catch (error: any) {
    console.error("ERRO NO LOG:", error);

    return NextResponse.json(
      { ia_result: "IA em manutenção. Tente mais tarde." },
      { status: 500 }
    );
  }
      }
