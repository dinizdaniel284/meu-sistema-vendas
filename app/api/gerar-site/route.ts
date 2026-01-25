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

    if (!produto) return NextResponse.json({ error: "Produto" }, { status: 400 });
    if (!userId) return NextResponse.json({ error: "Auth" }, { status: 401 });

    // 🧠 PROMPT DOUTRINADOR: Forcei o contexto de moda humana
    const prompt = `
      Você é um copywriter de MODA E ESTILO. Gere um JSON para o produto: "${produto}".
      
      REGRAS INEGOCIÁVEIS:
      1. Se o produto for "Bone" ou "Boné", trate EXCLUSIVAMENTE como vestuário/acessório de moda humana.
      2. É PROIBIDO mencionar cachorros, pets, ossos ou ração. 
      3. Foque em: Estilo, Tecido, Caimento, Status e Streetwear.
      4. Retorne APENAS o JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // 🌡️ Baixei mais para ela ser bem obediente
    });

    const responseText = completion.choices[0].message.content || "";
    let aiData;
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      return NextResponse.json({ error: "Falha na IA" }, { status: 500 });
    }

    // 🔗 CORREÇÃO DA IMAGEM: Adicionei "fashion_apparel" para a IA de imagem não desenhar um osso
    const tagBusca = `${produto} fashion apparel style`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_photography_of_human_wearing_${encodeURIComponent(tagBusca)}_high_fashion_boutique?width=1080&height=720&nologo=true`;
    
    const slugUnico = `${tagBusca.split('-')[0]}-${Math.random().toString(36).substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null
    };

    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId,
      model_used: "gpt-4o-mini"
    }]);

    if (insertError) return NextResponse.json({ error: "Erro Supabase" }, { status: 500 });

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      slug: slugUnico,
      ...conteudoFinal
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 });
  }
        }
