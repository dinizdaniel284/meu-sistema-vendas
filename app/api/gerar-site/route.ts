import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (Ajuste se as variáveis forem diferentes)
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

    // Geramos um slug único (ex: bolo-de-pote-12345)
    const slugUnico = `${tagBusca}-${Math.random().toString(36).substring(7)}`;

    // SALVANDO NO SUPABASE NA TABELA QUE VOCÊ CRIOU
    const { data, error } = await supabase
      .from('sites.') // Nome da tabela exatamente como no print
      .insert([
        { 
          slug: slugUnico, 
          conteudo: kitVendas, // Salva o JSON com headline, copy e imagem
          user_id: userId 
        }
      ])
      .select();

    if (error) throw error;

    // Retornamos os dados e a URL final para o usuário compartilhar
    return NextResponse.json({
      ...kitVendas,
      url: `https://seu-dominio.com/s/${slugUnico}`
    });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: 'Erro ao salvar site' }, { status: 500 });
  }
}
