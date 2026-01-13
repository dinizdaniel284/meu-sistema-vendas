import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    // TESTE 1: Nome padrão (O que deveria funcionar)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Se o erro 404 persistir mesmo após o push, mude a linha acima para:
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `O usuário vende ${nicho}. Como um especialista em Marketing Digital e IA, crie uma estratégia de vendas curta (máximo 3 frases) e impactante para ele atrair mais clientes hoje.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const { error } = await supabase
      .from('leads')
      .insert([{ 
        email, 
        nicho, 
        ai_analysis: text 
      }]);

    if (error) throw error;

    return NextResponse.json({ ia_result: text });

  } catch (error: any) {
    console.error("ERRO COMPLETO NO LOG:", error);
    return NextResponse.json({ 
      ia_result: `Erro Técnico: ${error.message || "Falha na conexão"}` 
    }, { status: 500 });
  }
}