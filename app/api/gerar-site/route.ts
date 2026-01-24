import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não informado" },
        { status: 400 }
      );
    }

    const prompt = `
Gere um JSON estrito para uma landing page de vendas do produto "${produto}" com:

{
  "headline": "",
  "subheadline": "",
  "guia_completo": "",
  "beneficios": [],
  "sobre_nos": ""
}

Regras:
- Linguagem brasileira
- Headline chamativa
- Subheadline curta
- Guia completo em parágrafos
- Benefícios em bullet points
- Sobre nós institucional
- Responda SOMENTE com JSON válido, sem markdown
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content || "";

    let aiData;
    try {
      aiData = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON inválido da IA:", responseText);
      return NextResponse.json(
        { error: "Falha ao converter resposta da IA em JSON" },
        { status: 500 }
      );
    }

    const tagBusca = produto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const urlImagemIA = `https://image.pollinations.ai/prompt/photography_${encodeURIComponent(tagBusca)}?width=1080&height=720`;

    const slugUnico = `${tagBusca}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null
    };

    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId || null
    }]);

    if (insertError) {
      console.error("❌ Erro Supabase:", insertError);
      return NextResponse.json(
        { error: "Erro ao salvar no Supabase" },
        { status: 500 }
      );
    }

    // 🔥 Correção do bug do dashboard
    return NextResponse.json({
      url: `/s/${slugUnico}`,
      ...conteudoFinal
    });

  } catch (err) {
    console.error("❌ Erro fatal:", err);
    return NextResponse.json(
      { error: 'Erro ao gerar site' },
      { status: 500 }
    );
  }
  }
