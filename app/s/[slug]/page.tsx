import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PageSite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle();

  if (error || !site) {
    if (error) console.error("Erro técnico ao buscar site:", error);
    notFound();
  }

  const conteudo = site.conteudo || {};
  const headline = conteudo.headline || "Produto Exclusivo";
  const subheadline = conteudo.subheadline || "Qualidade e Estilo em cada detalhe.";
  const guia_completo = conteudo.guia_completo || "";
  const sobre_nos = conteudo.sobre_nos || "";
  
  const beneficiosRaw = conteudo.beneficios || [];
  const beneficios = Array.isArray(beneficiosRaw) 
    ? beneficiosRaw 
    : typeof beneficiosRaw === 'string' 
      ? beneficiosRaw.split(',').map((b: string) => b.trim())
      : [];

  const imagem = conteudo.imagem || `https://images.unsplash.com/photo-1551434678-e076c223a692?q=90&w=2070&auto=format&fit=crop`;
  const whatsapp = conteudo.whatsapp || "";

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">

      {/* HERO - Ajustado para evitar o buraco no topo */}
      <section className="relative flex flex-col items-center justify-start overflow-hidden px-4 pt-16 pb-12 md:pt-32 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={imagem}
            alt={headline}
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          {/* Gradiente mais agressivo para fundir a imagem com o fundo preto */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/90 to-[#020617]" />
        </div>

        <div className="relative z-10 max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 rounded-full uppercase backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Oportunidade Exclusiva
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
            {headline}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto px-4 leading-relaxed opacity-90">
            {subheadline}
          </p>
          
          {/* Botão rápido para Mobile (Aumenta Conversão) */}
          <div className="mt-10 md:hidden">
             <a href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'} className="bg-emerald-600 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest">
                Quero aproveitar agora
             </a>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Coluna da Esquerda: Textos */}
          <div className="lg:col-span-7 space-y-16">
            <div className="relative">
              <div className="absolute -left-6 top-0 w-1 h-12 bg-emerald-500 rounded-full hidden md:block" />
              <h2 className="text-xs font-black text-emerald-500 tracking-[0.4em] uppercase mb-6">
                A Experiência
              </h2>

              <div className="text-slate-300 space-y-6 text-base md:text-lg font-normal leading-relaxed">
                {guia_completo
                  ? guia_completo.split('\n').filter(p => p.trim() !== "").map((p: string, i: number) => (
                      <p key={i} className="hover:text-white transition-colors">
                        {p}
                      </p>
                    ))
                  : <p>Descubra um novo padrão de excelência preparado especialmente para você.</p>
                }
              </div>
            </div>

            {sobre_nos && (
              <div className="group p-8 border border-white/5 bg-white/[0.02] rounded-3xl hover:bg-white/[0.04] transition-all">
                <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-widest">
                  Nossa Autoridade
                </h3>
                <p className="text-slate-400 italic text-base md:text-lg leading-relaxed group-hover:text-slate-300">
                  "{sobre_nos}"
                </p>
              </div>
            )}
          </div>

          {/* Coluna da Direita: Card de Ação (Sticky) */}
          <div className="lg:col-span-5">
            <div className="md:sticky md:top-24 bg-gradient-to-b from-white/[0.07] to-transparent backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h3 className="text-xl md:text-2xl font-black mb-8 text-white uppercase italic leading-tight">
                Vantagens <span className="text-emerald-500 block">Exclusivas</span>
              </h3>

              <ul className="space-y-5">
                {beneficios.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 group">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                    <span className="text-sm md:text-base text-slate-300 font-medium group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'}
                target="_blank"
                className="mt-12 w-full flex justify-center items-center gap-3 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 text-white font-black py-5 rounded-2xl text-base md:text-lg uppercase shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all"
              >
                QUERO GARANTIR AGORA 🚀
              </a>
              
              <p className="text-[10px] text-center text-slate-500 mt-6 uppercase tracking-tighter">
                Compra segura via WhatsApp
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 py-12 text-center bg-black/20">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">
          © 2026 DINIZ <span className="text-emerald-500">DEV</span> // VEXUS-AI SYSTEM
        </p>
      </footer>

    </main>
  );
                }
