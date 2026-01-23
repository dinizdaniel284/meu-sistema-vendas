import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ gemini-pro é o nome que a v1beta aceita sem reclamar
const MODEL_NAME = "gemini-pro";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    const prompt = `Gere um JSON estrito para o produto ${produto} com: headline, subheadline, guia_completo, beneficios (array), sobre_nos.`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonCleaned = responseText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonCleaned);
    
    const tagBusca = encodeURIComponent(produto.toLowerCase());
    const urlImagemIA = `https://image.pollinations.ai/prompt/photography_${tagBusca}?width=1080&height=720`;
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: { ...aiData, imagem: urlImagemIA, whatsapp: whatsapp || null },
      user_id: userId || null
    }]);

    return NextResponse.json({ url: `/s/${slugUnico}` });
  } catch (err) {
    console.error("❌ Erro fatal:", err);
    return NextResponse.json({ error: 'Erro ao gerar site' }, { status: 500 });
  }
      }
