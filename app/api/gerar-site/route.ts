import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto || !userId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 🧠 PROMPT OTIMIZADO - Adicionado instrução de parágrafos para evitar blocos gigantes
    const prompt = `Você é um copywriter de elite. Gere um JSON de vendas para: "${produto}". 
    O conteúdo deve ser luxuoso e persuasivo. No campo "guia_completo", use \n para separar parágrafos.
    Retorne APENAS o JSON puro:
    {
      "headline": "Título impactante",
      "subheadline": "Frase de apoio",
      "guia_completo": "Texto longo com parágrafos",
      "beneficios": ["b1", "b2", "b3"],
      "sobre_nos": "História de autoridade",
      "keyword_ingles": "Professional product keyword for photography"
    }`;

    let chatCompletion;
    let retries = 3;
    
    while (retries > 0) {
      try {
        chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", 
          temperature: 0.6,
          response_format: { type: "json_object" } 
        });
        break; 
      } catch (error: any) {
        retries--;
        if (retries === 0) throw new Error("A IA está instável. Tente novamente em instantes.");
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    const responseText = chatCompletion?.choices[0]?.message?.content || "";
    const aiData = JSON.parse(responseText);

    // 🖼️ BUSCA NO PEXELS - Melhorado o fallback
    let urlFinal = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop";
    
    if (process.env.PEXELS_API_KEY) {
      try {
        const termoBusca = aiData.keyword_ingles || produto;
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(termoBusca)}&per_page=1&orientation=landscape`, 
          {
            headers: { Authorization: process.env.PEXELS_API_KEY },
            // Removido AbortSignal.timeout para evitar conflitos em ambientes Edge antigos
          }
        );
        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          if (pexelsData.photos?.length > 0) urlFinal = pexelsData.photos[0].src.large2x;
        }
      } catch (e) {
        console.error("Erro Pexels:", e);
      }
    }

    const conteudoFinal = { ...aiData, imagem: urlFinal, whatsapp: whatsapp || null };
    
    // Slug mais limpo
    const tagBusca = produto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 7)}`;

    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId
    }]);

    if (insertError) throw insertError;

    return NextResponse.json({ 
      url: `/s/${slugUnico}`, 
      slug: slugUnico, 
      ...conteudoFinal 
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno" }, 
      { status: 500 }
    );
  }
                                                                          }
