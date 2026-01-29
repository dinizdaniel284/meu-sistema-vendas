import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

// 🚀 CONFIGURAÇÕES DE TEMPO E DINÂMICA
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  // 🔑 INICIALIZAÇÃO DENTRO DO POST: Evita erro de variável ausente no build
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    if (!produto || !userId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 🧠 PROMPT OTIMIZADO
    const prompt = `Você é um copywriter de elite internacional. Gere um JSON de vendas para o produto: "${produto}". 
    O conteúdo deve ser luxuoso, persuasivo e focado em conversão.
    Retorne APENAS o JSON puro, sem textos extras, neste formato:
    {
      "headline": "Título impactante e curto",
      "subheadline": "Frase de apoio que quebra objeções",
      "guia_completo": "Descrição detalhada e persuasiva de venda",
      "beneficios": ["benefício 1", "benefício 2", "benefício 3"],
      "sobre_nos": "Uma breve história de autoridade da marca",
      "keyword_ingles": "One or two professional keywords in ENGLISH for high-end photography search of this product"
    }`;

    // 🔄 SISTEMA DE RE-TENTATIVA (RETRY)
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
        console.error(`⚠️ Groq Connection Error. Tentativas restantes: ${retries}`);
        if (retries === 0) throw new Error("A Groq demorou muito para responder. Tente novamente.");
        await new Promise(res => setTimeout(res, 1500));
      }
    }

    const responseText = chatCompletion?.choices[0]?.message?.content || "";
    if (!responseText) throw new Error("A IA retornou um conteúdo vazio.");

    const aiData = JSON.parse(responseText.replace(/```json|```/g, "").trim());

    // 🖼️ BUSCA PROFISSIONAL NO PEXELS
    let urlFinal = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260";
    
    if (process.env.PEXELS_API_KEY) {
      try {
        const termoBusca = aiData.keyword_ingles || produto;
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(termoBusca)}&per_page=1&orientation=landscape`, 
          {
            headers: { Authorization: process.env.PEXELS_API_KEY },
            signal: AbortSignal.timeout(10000) 
          }
        );
        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          if (pexelsData.photos?.length > 0) urlFinal = pexelsData.photos[0].src.large2x;
        }
      } catch (e) {
        console.error("Pexels Timeout/Error, usando backup.");
      }
    }

    const conteudoFinal = { ...aiData, imagem: urlFinal, whatsapp: whatsapp || null };
    
    const tagBusca = produto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(2, 8)}`;

    const { error: insertError } = await supabase.from('sites').insert([{
      slug: slugUnico,
      conteudo: conteudoFinal,
      user_id: userId,
      model_used: "llama-3.3-70b-groq"
    }]);

    if (insertError) throw insertError;

    return NextResponse.json({ 
      url: `/s/${slugUnico}`, 
      slug: slugUnico, 
      ...conteudoFinal 
    });

  } catch (err: any) {
    console.error("❌ Erro Geral na Rota API:", err.message);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor" }, 
      { status: 500 }
    );
  }
}