import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

// Forçamos a inicialização limpa
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    // MUDANÇA CRITICAL: Usando o modelo flash-8b que é o mais compatível com v1beta atual
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    
    const prompt = `O usuário vende ${nicho}. Como um especialista em Marketing Digital e IA, crie uma estratégia de vendas curta (máximo 3 frases) e impactante para ele atrair mais clientes hoje.`;
    
    // Usamos o método mais simples de geração
    const result = await model.generateContent(prompt);
    const text = result.response.text();

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
    console.error("ERRO NO LOG:", error);
    
    // Se der erro de novo, vamos avisar exatamente qual é
    return NextResponse.json({ 
      ia_result: `Erro: Verifique sua chave ou modelo no Log.` 
    }, { status: 500 });
  }
}