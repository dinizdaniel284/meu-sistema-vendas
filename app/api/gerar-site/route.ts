import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produto, whatsapp, userId } = body;

    const tagBusca = encodeURIComponent(produto?.toLowerCase() || 'negocio');
    const urlImagemIA = `https://image.pollinations.ai/prompt/commercial_photography_of_${tagBusca}_high_quality?width=1080&height=720&nologo=true`;

    const kitVendas = {
      headline: `O melhor em ${produto}!`,
      copy: `Qualidade garantida para você.`,
      imagem: urlImagemIA,
      whatsapp: whatsapp
    };

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    // Nome da tabela ajustado para 'sites' (sem o ponto)
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
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
