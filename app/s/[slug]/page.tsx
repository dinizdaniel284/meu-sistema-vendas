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

  const imagem = conteudo.imagem || `https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop`;
  const whatsapp = conteudo.whatsapp || "";

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* --- HERO SECTION OTIMIZADA --- */}
      <section className="relative min-h-[100vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden px-4 md:px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src={imagem} 
            alt={headline} 
            className="w-full h-full object-cover opacity-40 md:opacity-30 scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/95 to-[#020617]" />
        </div>
        
        <div className="relative z-10 max-w-5xl text-center pt-20">
          <span className="inline-block px-3 py-1 mb-6 text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-emerald-400 border border-emerald-500/30 rounded-full bg-emerald-500/5 backdrop-blur-sm uppercase">
            Oportunidade Exclusiva
          </span>
          <h1 className="text-3xl md:text-8xl font-black text-white mb-6 md:mb-8 leading-[1.1] md:leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl px-2">
            {headline}
          </h1>
          <p className="text-base md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed px-4">
            {subheadline}
          </p>
        </div>
      </section>

      {/* --- CONTEÚDO E BENEFÍCIOS --- */}
      <section id="conteudo" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16">
          
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h2 className="text-xs font-black text-emerald-500 tracking-[0.4em] uppercase mb-4">A Experiência</h2>
              <div className="text-slate-300 leading-relaxed space-y-6 text-lg md:text-xl font-light">
                {guia_completo ? (
                  guia_completo.split('\n').map((par: string, i: number) => (
                    <p key={i}>{par}</p>
                  ))
                ) : (
                  <p>Descubra um novo padrão de excelência desenvolvido para quem busca o extraordinário.</p>
                )}
              </div>
            </div>

            {sobre_nos && (
              <div className="p-6 md:p-8 border-l-2 border-emerald-500/30 bg-white/5 rounded-r-3xl">
                <h3 className="text-base md:text-lg font-bold text-white mb-4 italic uppercase">Nossa Autoridade</h3>
                <p className="text-slate-400 italic text-base md:text-lg leading-relaxed">{sobre_nos}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="md:sticky md:top-12 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/10 shadow-2xl">
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-white uppercase italic tracking-tighter">
                Por que escolher <span className="text-emerald-500">Isto?</span>
              </h3>
              <ul className="space-y-4 md:space-y-6">
                {beneficios.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 md:gap-4 group">
                    <div className="mt-1 h-5 w-5 rounded-full border border-emerald-500/50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-all duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 group-hover:bg-white" />
                    </div>
                    <span className="text-base md:text-lg text-slate-300 font-medium group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 md:mt-12">
                <a
                  href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Olá! Quero saber mais sobre ${headline}.` : '#'}
                  target="_blank"
                  className="relative flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all text-lg md:text-xl uppercase tracking-tighter shadow-xl active:scale-95"
                >
                  GARANTIR AGORA 🚀
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center px-6">
        <p className="text-[9px] md:text-[10px] text-slate-600 uppercase tracking-[0.5em] font-black">
          &copy; 2026 DINIZ <span className="text-emerald-500">DEV</span> IA - Todos os direitos reservados
        </p>
      </footer>

      {/* WHATSAPP MOBILE */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <a
          href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'}
          className="bg-emerald-500 p-4 rounded-full shadow-2xl flex items-center justify-center animate-bounce"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.627 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

    </main>
  );
                }
