import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { produto, whatsapp } = await req.json();

    // Limpamos o nome do produto para a busca de imagem não bugar
    const tagBusca = encodeURIComponent(produto.toLowerCase());

    const kitVendas = {
      headline: `A Solução Definitiva em ${produto} que Você Procurava!`,
      copy: `Cansado de procurar por ${produto} e não encontrar qualidade real? Nossa metodologia exclusiva garante os melhores resultados do mercado. Junte-se a centenas de clientes satisfeitos e transforme sua realidade hoje mesmo com o melhor custo-benefício.`,
      
      // HTML estruturado para Tailwind CSS (Preview Full)
      html: `
        <div class="space-y-8">
          <div class="grid md:grid-cols-2 gap-6 text-left">
            <div class="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 class="text-blue-400 font-bold mb-2 flex items-center gap-2">🚀 Rapidez</h3>
              <p class="text-sm text-slate-400">Processo otimizado para você não perder tempo e focar no que importa.</p>
            </div>
            <div class="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 class="text-purple-400 font-bold mb-2 flex items-center gap-2">💎 Qualidade</h3>
              <p class="text-sm text-slate-400">O padrão de excelência em ${produto} que o seu projeto merece.</p>
            </div>
          </div>
          
          <div class="text-center pt-8">
            <a href="https://wa.me/${whatsapp}?text=Olá! Vim pelo site e quero saber mais sobre ${produto}" 
               target="_blank" 
               class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black px-10 py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">
              QUERO MEU ${produto.toUpperCase()} AGORA!
            </a>
            <p class="text-xs text-slate-500 mt-4 italic">Fale diretamente com nossa equipe via WhatsApp</p>
          </div>
        </div>
      `,
      
      // NOVO MOTOR DE IMAGEM: Unsplash com tags de alta qualidade
      // Adicionamos "product, gourmet" para garantir que venha algo profissional
      imagem: `https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop` // Fallback caso queira uma fixa de doce
    };

    // Ajuste final na URL da imagem para ser ultra dinâmica e precisa:
    kitVendas.imagem = `https://source.unsplash.com/1200x800/?${tagBusca},product,professional,food`;

    return NextResponse.json(kitVendas);
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: 'Erro ao gerar o kit' }, { status: 500 });
  }
}