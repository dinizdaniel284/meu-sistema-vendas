import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔹 Conexão Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔹 Conexão Google Generative AI
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

// 🔹 Modelos (qualidade + fallback)
const PRIMARY_MODEL = "models/gemini-1.5-pro";        // mais qualidade
const FALLBACK_MODEL = "models/gemini-1.5-flash-001"; // mais rápido / free

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) {
      throw new Error("O campo nicho não foi enviado.");
    }

    let text = "";
    let modelUsed = PRIMARY_MODEL;

    const prompt = `
Atue como um Especialista em Marketing Digital focado em conversão.
O usuário vende: ${nicho}.

Gere um plano de ação rápido seguindo EXATAMENTE este formato:

🎯 ESTRATÉGIA MATADORA:
(Uma estratégia prática de 2 frases com gatilhos mentais para aplicar agora)

📱 LEGENDA PRONTA PARA POST:
(Uma legenda persuasiva com emojis e 3 hashtags para Instagram/WhatsApp)

💡 DICA DE OURO:
(Uma sacada extra de fechamento de vendas que quase ninguém usa)

Regras:
- Linguagem clara, profissional e persuasiva
- Nada genérico
- Responder em Português do Brasil
    `;

    try {
      // 🔹 Tentativa com modelo de mais qualidade
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (primaryError) {
      console.warn("⚠️ Falha no modelo PRO. Usando fallback FLASH...", primaryError);

      // 🔹 Fallback automático
      const fallbackModel = genAI.getGenerativeModel({
        model: FALLBACK_MODEL,
      });

      const fallbackResult = await fallbackModel.generateContent(prompt);
      text = fallbackResult.response.text();
      modelUsed = FALLBACK_MODEL;
    }

    // 🔹 Salvar lead no Supabase
    const { error } = await supabase
      .from("leads")
      .insert([
        {
          email,
          nicho,
          ai_analysis: text,
          model_used: modelUsed, // opcional: cria essa coluna se quiser auditar
        },
      ]);

    if (error) {
      console.error("Erro Supabase:", error.message);
    }

    console.log("✅ IA respondeu com o modelo:", modelUsed);

    return NextResponse.json({
      ia_result: text,
      model_used: modelUsed,
    });

  } catch (error: any) {
    console.error("❌ ERRO NO LOG:", error);

    return NextResponse.json(
      {
        ia_result: "IA em alta demanda. Aguarde 30 segundos e tente novamente.",
      },
      { status: 500 }
    );
  }
}
