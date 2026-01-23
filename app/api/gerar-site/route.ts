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
Gere um JSON estrito para o produto "${produto}" com:
headline,
subheadline,
guia_completo,
beneficios (array),
sobre_nos.

Responda SOMENTE com JSON válido, sem markdown.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content || "";

    const aiData = JSON.parse(responseText);

    const tagBusca = encodeURIComponent(produto.toLowerCase());
    const urlImagemIA = `https://image.pollinations.ai/prompt/photography_${tagBusca}?width=1080&height=720`;
    const slugUnico = `${tagBusca}-${Math.random()
      .toString(36)
      .substring(7)}`;

    await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: {
        ...aiData,
        imagem: urlImagemIA,
        whatsapp: whatsapp || null
      },
      user_id: userId || null
    }]);

    return NextResponse.json({ url: `/s/${slugUnico}` });

  } catch (err) {
    console.error("❌ Erro fatal:", err);
    return NextResponse.json(
      { error: 'Erro ao gerar site' },
      { status: 500 }
    );
  }
}
