import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    // 1. VOLTANDO PARA O MODELO ESTÁVEL (1.5-flash)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Atue como um Copywriter Senior focado em vendas. 
      O usuário está criando um site para: ${produto}.
      Gere um JSON estrito (sem blocos de código markdown) com as seguintes chaves em português:
      {
        "headline": "Uma headline matadora",
        "subheadline": "Um parágrafo explicando como isso agrega valor e transforma a vida do cliente",
        "guia_completo": "Um texto de 3 parágrafos detalhando o produto/serviço, como funciona e por que é a melhor escolha",
        "beneficios": ["beneficio 1", "beneficio 2", "beneficio 3"],
        "sobre_nos": "Um texto institucional curto e confiável"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpeza extra para garantir que o JSON seja lido corretamente
    const jsonCleaned = responseText.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonCleaned);

    // 2. Gerar a imagem baseada no nicho
    const tagBusca = encodeURIComponent(produto?.toLowerCase() || 'business');
    const urlImagemIA = `https://image.pollinations.ai/prompt/commercial_photography_of_${tagBusca}_lifestyle_high_quality?width=1080&height=720&nologo=true`;

    // 3. Montar o Kit de Vendas Robusto
    const kitVendas = {
      ...aiData,
      imagem: urlImagemIA,
      whatsapp: whatsapp
    };

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    // 4. Salvar na tabela 'sites'
    const { error } = await supabase
      .from('sites') 
      .insert([
        { 
          slug: slugUnico, 
          conteudo: kitVendas,
          user_id: userId || null 
        }
      ]);

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...kitVendas,
      url: `/s/${slugUnico}`
    });

  } catch (err) {
    console.error("Erro na API:", err);
    return NextResponse.json(
      { error: 'IA em alta demanda. Tente novamente em alguns segundos.' }, 
      { status: 500 }
    );
  }
}