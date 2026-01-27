import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function gerarFallback(produto: string) {
  return {
    headline: `Conheça o ${produto}`,
    subheadline: "Oferta especial por tempo limitado",
    guia_completo: `O ${produto} foi desenvolvido para quem busca qualidade, praticidade e um excelente custo-benefício.

Garanta agora e aproveite uma experiência incrível.`,
    beneficios: [
      "Alta qualidade",
      "Entrega rápida",
      "Preço acessível"
    ],
    sobre_nos: "Somos uma marca focada em oferecer produtos confiáveis e com ótimo valor."
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto) return NextResponse.json({ error: "Produto obrigatório" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    let aiData: any = null;
    let erroIA = false;

    if (openai) {
      try {
        const prompt = `
Você é um copywriter de elite especialista em Vendas Online. Gere um JSON para o produto: "${produto}".

Retorne APENAS o JSON no formato:
{
  "headline": "Título impacto",
  "subheadline": "Frase curta",
  "guia_completo": "Texto longo de venda",
  "beneficios": ["item 1", "item 2", "item 3"],
  "sobre_nos": "Nossa marca"
}
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
        });

        const responseText = completion.choices[0].message.content || "";
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        aiData = JSON.parse(cleanJson);
      } catch (err) {
        console.error("⚠️ OpenAI falhou, usando fallback:", err);
        erroIA = true;
      }
    } else {
      erroIA = true;
    }

    if (!aiData) {
      aiData = gerarFallback(produto);
    }

    const tagBusca = produto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-");

    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_studio_photography_of_${encodeURIComponent(tagBusca)}_high_quality_4k_commercial?width=1080&height=720&nologo=true`;

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null,
      fallback: erroIA
    };

    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId,
      model_used: erroIA ? "fallback" : "gpt-4o-mini"
    }]);

    if (insertError) {
      console.error("Erro Supabase:", insertError);
      return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 });
    }

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      ...conteudoFinal
    });

  } catch (err) {
    console.error("❌ Erro geral API gerar-site:", err);
    return NextResponse.json({ error: "Erro interno ao gerar site" }, { status: 500 });
  }
}
