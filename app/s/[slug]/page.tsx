import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PageSite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Buscar site pelo slug de forma segura
  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle(); // <-- Alterado de .single() para .maybeSingle()

  // Se der erro de conexão ou o site realmente não existir (data for null)
  if (error || !site) {
    if (error) console.error("Erro técnico ao buscar site:", error);
    notFound(); // Redireciona para a página 404 padrão do Next.js
  }

  // Desestruturando os campos da IA
  const {
    headline = "Título do Site",
    subheadline = "Subheadline não informada",
    guia_completo = "Guia completo não informado.",
    beneficios = ["Qualidade", "Segurança", "Resultados"],
    sobre_nos = "Sobre nós não informado.",
    imagem = "https://via.placeholder.com/1080x720?text=Sem+Imagem",
    whatsapp = ""
  } = site.conteudo || {};

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* HERO */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={imagem}
          alt={headline}
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]" />
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter italic uppercase">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl text-blue-400 font-medium max-w-2xl mx-auto leading-relaxed italic">
            {subheadline}
          </p>
        </div>
      </section>

      {/* GUIA E BENEFÍCIOS */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* GUIA COMPLETO */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 italic">
              <span className="w-8 h-1 bg-blue-500 rounded-full" /> O GUIA COMPLETO
            </h2>
            <div className="text-slate-400 leading-relaxed space-y-4 text-lg">
              {guia_completo.split('\n').map((paragrafo: string, i: number) => (
                <p key={i}>{paragrafo}</p>
              ))}
            </div>
          </div>

          {/* BENEFÍCIOS */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-blue-500">
              Por que nos escolher?
            </h3>
            <ul className="space-y-4">
              {beneficios.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full text-xs">✓</span>
                  <span className="font-medium text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SOBRE NÓS */}
      <section className="bg-white/[0.02] py-20 border-y border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">Conheça nossa História</h2>
          <p className="text-lg text-slate-400 leading-relaxed italic">{sobre_nos}</p>
        </div>
      </section>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <a
          href={whatsapp ? `https://wa.me/${whatsapp}?text=Olá! Quero saber mais sobre ${headline}.` : '#'}
          target="_blank"
          className={`group block w-full ${whatsapp ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-600 cursor-not-allowed'} text-white text-center font-black py-6 rounded-2xl transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)] text-2xl uppercase relative overflow-hidden`}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {whatsapp ? 'GARANTIR MEU ACESSO AGORA 🚀' : 'WhatsApp não disponível'}
          </span>
        </a>

        <p className="mt-12 text-[10px] text-slate-600 uppercase tracking-[0.4em] font-bold">
          Powered by <span className="text-blue-600">DINIZ DEV IA</span>
        </p>
      </div>
    </main>
  );
}
