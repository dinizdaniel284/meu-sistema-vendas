import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto)
      return NextResponse.json({ error: "Produto" }, { status: 400 });

    if (!userId)
      return NextResponse.json({ error: "Auth" }, { status: 401 });

    const prompt = `
Você é um copywriter de elite especialista em Vendas Online. Gere um JSON para o produto: "${produto}".

REGRAS RÍGIDAS:
1. Identifique o nicho (Comida, Moda, Eletrônicos, etc) e use o tom de voz adequado.
2. Se for Moda (Boné), foque em Estilo. Se for Comida (Bolo), foque em Sabor e Desejo.
3. É PROIBIDO misturar nichos (não fale de pets para humanos, nem de roupas para comida).
4. Retorne APENAS o JSON no formato:
{
  "headline": "Título impacto",
  "subheadline": "Frase curta",
  "guia_completo": "Texto longo de venda",
  "beneficios": ["item 1", "item 2", "item 3"],
  "sobre_nos": "Nossa marca"
}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    // 🔒 EXTRAÇÃO SEGURA DO TEXTO
    let responseText = "";

    if (response.output_text) {
      responseText = response.output_text;
    } else if (Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "message") {
          for (const part of item.content) {
            if (part.type === "output_text") {
              responseText += part.text;
            }
          }
        }
      }
    }

    if (!responseText) {
      console.error("Resposta vazia da OpenAI:", response);
      return NextResponse.json({ error: "Falha na IA" }, { status: 500 });
    }

    let aiData;
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA:", responseText);
      return NextResponse.json({ error: "Falha na IA" }, { status: 500 });
    }

    const tagBusca = produto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-");

    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_studio_photography_of_${encodeURIComponent(
      tagBusca
    )}_high_quality_4k_commercial?width=1080&height=720&nologo=true`;

    const slugUnico = `${tagBusca}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null,
    };

    const { error: insertError } = await supabase.from("sites").insert([
      {
        slug: slugUnico,
        conteudo: conteudoFinal,
        user_id: userId,
        model_used: "gpt-4o-mini",
      },
    ]);

    if (insertError) {
      console.error("Erro Supabase:", insertError);
      return NextResponse.json({ error: "Erro Supabase" }, { status: 500 });
    }

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      ...conteudoFinal,
    });
  } catch (err) {
    console.error("Erro geral API gerar-site:", err);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
