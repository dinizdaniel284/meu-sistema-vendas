import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { produto, whatsapp, userId } = await req.json();

    const tagBusca = encodeURIComponent(produto.toLowerCase());
    const urlImagemIA = `https://image.pollinations.ai/prompt/professional_commercial_photography_of_${tagBusca}_extremely_detailed_high_quality_advertising_style?width=1080&height=720&nologo=true`;

    const kitVendas = {
      headline: `A Solução Definitiva em ${produto} que Você Procurava!`,
      copy: `Cansado de procurar por ${produto} e não encontrar qualidade real? Nossa metodologia exclusiva garante os melhores resultados do mercado.`,
      imagem: urlImagemIA,
      whatsapp: whatsapp
    };

    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    const { data, error } = await supabase
      .from('sites.') 
      .insert([
        { 
          slug: slugUnico, 
          conteudo: kitVendas,
          user_id: userId 
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      ...kitVendas,
      url: `/s/${slugUnico}`
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: 'Erro ao salvar site' }, { status: 500 });
  }
}
