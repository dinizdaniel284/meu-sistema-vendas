import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ✅ NOME TÉCNICO OFICIAL PARA EVITAR 404
const PRIMARY_MODEL = "gemini-1.5-flash-latest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    const prompt = `Atue como um Copywriter Sênior. Produto: ${produto}.
    Retorne APENAS um JSON:
    {
      "headline": "headline matadora",
      "subheadline": "valor transformador",
      "guia_completo": "texto de 3 parágrafos",
      "beneficios": ["b1", "b2", "b3"],
      "sobre_nos": "texto institucional"
    }`;

    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonCleaned = responseText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonCleaned);
    
    const tagBusca = encodeURIComponent(produto.toLowerCase());
    const urlImagemIA = `https://image.pollinations.ai/prompt/commercial_photography_${tagBusca}?width=1080&height=720&nologo=true`;
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    const { error } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: { ...aiData, imagem: urlImagemIA, whatsapp: whatsapp || null },
      user_id: userId || null,
      model_used: PRIMARY_MODEL
    }]);

    if (error) throw error;
    return NextResponse.json({ url: `/s/${slugUnico}`, model_used: PRIMARY_MODEL });
  } catch (err) {
    console.error("❌ Erro /api/gerar-site:", err);
    return NextResponse.json({ error: 'Erro ao gerar site' }, { status: 500 });
  }
      }
