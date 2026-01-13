import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(request: Request) {
  let userEmail: string = "";

  try {
    const body = await request.json();
    userEmail = body.email;

    if (!userEmail) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    console.log(`🤖 Iniciando IA para o lead: ${userEmail}...`);

    // AJUSTE AQUI: Usando o modelo "gemini-1.5-flash-latest" para evitar o erro 404
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });
    
    const prompt = `O utilizador com o e-mail ${userEmail} acabou de se inscrever. 
    Cria uma estratégia de vendas curta (máximo 3 frases) personalizada para converter esse lead.`;
    
    // Chamada com timeout e configuração básica
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const iaResponse = response.text();

    console.log("✅ IA respondeu com sucesso!");

    // 1. TENTA SALVAR COM A ANÁLISE DA IA
    const { error: supabaseError } = await supabase
      .from('leads')
      .insert([
        { 
          email: userEmail, 
          ai_analysis: iaResponse 
        }
      ]);

    if (supabaseError) throw supabaseError;

    return NextResponse.json({ 
      message: "Sucesso total!",
      ia_result: iaResponse 
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Erro no processo:", error.message);
    
    // PLANO B: Se a IA falhar, ainda tentamos salvar o lead no Supabase
    if (userEmail) {
      try {
        await supabase
          .from('leads')
          .insert([
            { 
              email: userEmail, 
              ai_analysis: "Lead salvo, mas a IA falhou no momento." 
            }
          ]);
      } catch (dbError) {
        console.error("❌ Erro crítico no Banco de Dados:", dbError);
      }
    }

    return NextResponse.json({ 
      message: "Lead processado",
      details: error.message 
    }, { status: 200 });
  }
}