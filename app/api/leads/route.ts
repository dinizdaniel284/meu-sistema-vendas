import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔹 Conexão Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔹 Conexão Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    // Volte para este que é o "tanque de guerra" da cota grátis
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Atue como um Especialista em Marketing Digital. O usuário vende: ${nicho}.
      Gere um plano de ação rápido seguindo EXATAMENTE este formato:

      🎯 ESTRATÉGIA MATADORA:
      (Uma estratégia prática de 2 frases com gatilhos mentais para aplicar agora)

      📱 LEGENDA PRONTA PARA POST:
      (Uma legenda persuasiva com emojis e 3 hashtags para Instagram/WhatsApp)

      💡 DICA DE OURO:
      (Uma sacada extra de fechamento de vendas que quase ninguém usa)

      Responda em Português do Brasil, de forma clara e profissional.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔹 Salvar lead no Supabase
    // IMPORTANTE: Verifique se a coluna 'ai_analysis' existe na tabela 'leads'
    const { error } = await supabase
      .from("leads")
      .insert([{ 
        email, 
        nicho, 
        ai_analysis: text 
      }]);

    if (error) {
       console.error("Erro Supabase:", error.message);
       // Se der erro na coluna, ele ainda retorna o texto da IA para não frustrar o usuário
    }

    return NextResponse.json({ ia_result: text });

  } catch (error: any) {
    console.error("ERRO NO LOG:", error);
    return NextResponse.json(
      { ia_result: "IA em alta demanda. Aguarde 30 segundos e tente novamente." },
      { status: 500 }
    );
  }
}