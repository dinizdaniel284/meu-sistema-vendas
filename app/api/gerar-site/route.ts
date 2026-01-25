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
      return NextResponse.json({ error: "Produto não informado" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    // 🧠 PROMPT RÍGIDO: Evita misturar nichos e garante copy de alta conversão
    const prompt = `
      Você é um copywriter de elite. Gere um JSON estrito para uma landing page do produto: "${produto}".

      REGRAS CRÍTICAS:
      1. Se o produto for de vestuário (ex: Boné), foque 100% em MODA, ESTILO e STATUS.
      2. É PROIBIDO citar animais, pets ou acessórios pets a menos que o produto seja EXPLICITAMENTE para eles.
      3. Use linguagem persuasiva (Copywriting).
      4. Retorne APENAS o JSON, sem textos extras.

      FORMATO:
      {
        "headline": "Título impacto",
        "subheadline": "Frase curta",
        "guia_completo": "Texto detalhado",
        "beneficios": ["beneficio 1", "beneficio 2", "beneficio 3"],
        "sobre_nos": "Nossa marca"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5, // 🌡️ Menor temperatura = menos "viagem" da IA
    });

    const responseText = completion.choices[0].message.content || "";
    let aiData;
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      return NextResponse.json({ error: "Falha na IA" }, { status: 500 });
    }

    // 🔗 Geração de Slug e Imagem
    const tagBusca = produto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_photography_of_${encodeURIComponent(tagBusca)}_lifestyle_high_quality?width=1080&height=720&nologo=true`;
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null
    };

    // ✅ Salvando no Supabase com o user_id (Privacidade)
    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId,
      model_used: "gpt-4o-mini"
    }]);

    if (insertError) {
      console.error("❌ Erro Supabase:", insertError);
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    // ✅ Retorno com o SLUG explícito para o frontend não se perder
    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      ...conteudoFinal
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro ao gerar site' }, { status: 500 });
  }
}
