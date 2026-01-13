import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

// Inicialização da API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    if (!nicho) throw new Error("O campo nicho não foi enviado.");

    // MUDANÇA CRUCIAL: Forçamos a apiVersion para 'v1' para acabar com o erro 404
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1' }
    );
    
    const prompt = `O usuário vende ${nicho}. Como um especialista em Marketing Digital e IA, crie uma estratégia de vendas curta (máximo 3 frases) e impactante para ele atrair mais clientes hoje.`;
    
    // Gerando o conteúdo
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Salva no banco de dados (Supabase)
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
    
    return NextResponse.json({ 
      ia_result: "A IA está atualizando. Tente novamente em 1 minuto." 
    }, { status: 500 });
  }
}
