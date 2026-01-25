import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// IMPORTANTE: Use o createClient que suporta Auth no Server Side se possível
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
    // ✅ Agora priorizamos o userId que vem do Auth ou do Body com validação
    const { produto, whatsapp, userId } = body;

    if (!produto) {
      return NextResponse.json({ error: "Produto não informado" }, { status: 400 });
    }

    // 🛡️ Validação de Segurança: Se não houver userId, o banco vai rejeitar o insert
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
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
Regras: Linguagem brasileira persuasiva, SOMENTE JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content || "";
    let aiData;
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      return NextResponse.json({ error: "Falha na IA" }, { status: 500 });
    }

    const tagBusca = produto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_photography_of_${encodeURIComponent(tagBusca)}_lifestyle_high_quality?width=1080&height=720&nologo=true`;
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`;

    const conteudoFinal = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp || null
    };

    // ✅ O INSERT agora passa obrigatoriamente o user_id para respeitar a RLS
    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId, // Vínculo direto com o dono do site
      model_used: "gpt-4o-mini"
    }]);

    if (insertError) {
      console.error("❌ Erro Supabase:", insertError);
      return NextResponse.json({ error: "Erro ao salvar: verifique se você está logado corretamente" }, { status: 500 });
    }

    return NextResponse.json({
      url: `/s/${slugUnico}`,
      ...conteudoFinal
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro ao gerar site' }, { status: 500 });
  }
}
