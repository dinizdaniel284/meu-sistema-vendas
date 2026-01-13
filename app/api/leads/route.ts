import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(request: Request) {
  // Definimos o email fora do try para o 'catch' conseguir enxergar ele sem alertas
  let userEmail: string = "";

  try {
    const body = await request.json();
    userEmail = body.email;

    if (!userEmail) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    console.log(`🤖 Iniciando IA para o lead: ${userEmail}...`);

    // Usando o modelo estável
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `O utilizador com o e-mail ${userEmail} acabou de se inscrever. 
    Cria uma estratégia de vendas curta (máximo 3 frases) personalizada para converter esse lead.`;
    
    const result = await model.generateContent(prompt);
    const iaResponse = result.response.text();

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
    
    // PLANO B: Se algo deu errado (IA ou Banco), tentamos salvar apenas o e-mail
    // Usamos a variável 'userEmail' que definimos no topo do código
    if (userEmail) {
      await supabase
        .from('leads')
        .insert([
          { 
            email: userEmail, 
            ai_analysis: "Processado com erro na IA." 
          }
        ]);
    }

    return NextResponse.json({ 
      message: "Lead recebido (IA offline)",
      details: error.message 
    }, { status: 200 });
  }
}