import { createClient } from '@supabase/supabase-js'; 
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

// AJUSTADO: Agora o nome bate com o seu arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, nicho } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `O usuário vende ${nicho}. Como um especialista em Marketing Digital e IA, crie uma estratégia de vendas curta (máximo 3 frases) e impactante para ele atrair mais clientes hoje.`;
    
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

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ia_result: "Venda mais usando o poder da IA e Next.js!" }, { status: 500 });
  }
}