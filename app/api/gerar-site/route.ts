import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔹 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔹 Google Generative AI
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

// 🔹 Modelos (qualidade + fallback)
const PRIMARY_MODEL = "models/gemini-1.5-pro";
const FALLBACK_MODEL = "models/gemini-1.5-flash-001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto) {
      return NextResponse.json(
        { error: "O campo produto é obrigatório." },
        { status: 400 }
      );
    }

    let responseText = "";
    let modelUsed = PRIMARY_MODEL;

    const prompt = `
Atue como um Copywriter Sênior focado em vendas e conversão.
O usuário está criando um site para: ${produto}.

Gere um JSON estrito (sem blocos de código markdown) com as seguintes chaves em português:
{
  "headline": "Uma headline matadora",
  "subheadline": "Um parágrafo explicando como isso agrega valor e transforma a vida do cliente",
  "guia_completo": "Um texto de 3 parágrafos detalhando o produto/serviço, como funciona e por que é a melhor escolha",
  "beneficios": ["benefício 1", "benefício 2", "benefício 3"],
  "sobre_nos": "Um texto institucional curto e confiável"
}

Regras:
- Retornar SOMENTE o JSON válido
- Nada de comentários ou explicações
- Linguagem clara, persuasiva e profissional
    `;

    try {
      // 🔹 Tentativa com modelo de mais qualidade
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (primaryError) {
      console.warn("⚠️ Falha no modelo PRO. Usando fallback FLASH...", primaryError);

      const fallbackModel = genAI.getGenerativeModel({
        model: FALLBACK_MODEL,
      });

      const fallbackResult = await fallbackModel.generateContent(prompt);
      responseText = fallbackResult.response.text();
      modelUsed = FALLBACK_MODEL;
    }

    // 🔹 Limpeza extra para garantir JSON válido
    const jsonCleaned = responseText
      .replace(/```json|```/g, "")
      .trim();

    let aiData: any;

    try {
      aiData = JSON.parse(jsonCleaned);
    } catch (parseError) {
      console.error("❌ Erro ao parsear JSON da IA:", jsonCleaned);
      throw new Error("Resposta da IA não veio em JSON válido.");
    }

    // 🔹 Gerar imagem baseada no nicho
    const tagBusca = encodeURIComponent(produto.toLowerCase());
    const urlImagemIA = `https://image.pollinations.ai/prompt/commercial_photography_of_${tagBusca}_lifestyle_high_quality?width=1080&height=720&nologo=true`;

    // 🔹 Montar Kit de Vendas
    const kitVendas = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null,
    };

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    // 🔹 Salvar na tabela 'sites'
    const { error } = await supabase
      .from('sites')
      .insert([
        {
          slug: slugUnico,
          conteudo: kitVendas,
          user_id: userId || null,
          model_used: modelUsed, // opcional
        },
      ]);

    if (error) {
      console.error("Erro Supabase:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ /api/gerar-site respondeu com:", modelUsed);

    return NextResponse.json({
      ...kitVendas,
      url: `/s/${slugUnico}`,
      model_used: modelUsed,
    });

  } catch (err) {
    console.error("❌ Erro na API /api/gerar-site:", err);

    return NextResponse.json(
      { error: 'IA em alta demanda. Tente novamente em alguns segundos.' },
      { status: 500 }
    );
  }
}
