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
- Linguagem brasileira persuasiva
- Responda SOMENTE com JSON válido, sem markdown ou explicações
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content || "";

    let aiData;
    try {
      // Limpeza para garantir que apenas o JSON seja parseado
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("❌ JSON inválido da IA:", responseText);
      return NextResponse.json(
        { error: "Falha ao converter resposta da IA em JSON" },
        { status: 500 }
      );
    }

    // ✅ Melhoria na geração da Tag de busca para a imagem
    const tagBusca = produto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // ✅ URL da imagem garantida para aparecer no Dashboard
    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_photography_of_${encodeURIComponent(tagBusca)}_lifestyle_high_quality?width=1080&height=720&nologo=true`;

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA, // Injetando a imagem aqui para o Dashboard ler
      whatsapp: whatsapp || null
    };

    // ✅ Salvando com o campo 'model_used' para seu controle
    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId || null,
      model_used: "gpt-4o-mini"
    }]);

    if (insertError) {
      console.error("❌ Erro Supabase:", insertError);
      return NextResponse.json(
        { error: "Erro ao salvar no Supabase" },
        { status: 500 }
      );
    }

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