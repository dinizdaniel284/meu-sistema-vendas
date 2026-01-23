import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Adicionamos 'async' nos params para garantir compatibilidade com versões novas do Next
export default async function PageSite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Busca os dados usando o nome da tabela SEM O PONTO
  const { data: site, error } = await supabase
    .from('sites') // AJUSTADO: Removido o ponto aqui
    .select('*')
    .eq('slug', slug)
    .single();

  // Se der erro ou não achar o slug, manda pro 404
  if (error || !site) {
    console.error("Erro ao buscar site:", error);
    notFound();
  }

  const { headline, copy, imagem, whatsapp } = site.conteudo;

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans">
      <div className="w-full h-64 md:h-96 relative">
        <img 
          src={imagem} 
          alt={headline} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            {headline}
          </h1>
          
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            {copy}
          </p>

          <a 
            href={`https://wa.me/${whatsapp}?text=Olá! Vi seu site e tenho interesse.`}
            target="_blank"
            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center font-black py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] text-xl uppercase"
          >
            Falar no WhatsApp Agora
          </a>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            Criado por <span className="text-blue-500">DINIZ DEV IA</span>
          </p>
        </div>
      </div>
    </main>
  );
}