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

      {/* HERO - Ajustado: Removido min-h-screen e justify-center para acabar com o buraco no topo */}
      <section className="relative flex flex-col items-center justify-start overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src={imagem}
            alt={headline}
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/90 to-[#020617]" />
        </div>

        <div className="relative z-10 max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 rounded-full uppercase backdrop-blur-sm">
            Oportunidade Exclusiva
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
            {headline}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto px-4 leading-relaxed opacity-90">
            {subheadline}
          </p>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL - Ajustado para evitar espaços vazios no final */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Coluna da Esquerda: Textos Alinhados Corretamente */}
          <div className="lg:col-span-7 space-y-16">
            <div>
              <h2 className="text-xs font-black text-emerald-500 tracking-[0.4em] uppercase mb-6">
                A Experiência
              </h2>

              <div className="text-slate-300 space-y-6 text-base md:text-lg font-normal leading-relaxed text-left">
                {guia_completo
                  ? guia_completo.split('\n').filter((p: string) => p.trim() !== "").map((p: string, i: number) => (
                      <p key={i} className="hover:text-white transition-colors">
                        {p}
                      </p>
                    ))
                  : <p>Descubra um novo padrão de excelência preparado especialmente para você.</p>
                }
              </div>
            </div>

            {sobre_nos && (
              <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl">
                <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-widest">
                  Nossa Autoridade
                </h3>
                <p className="text-slate-400 italic text-base md:text-lg leading-relaxed">
                  "{sobre_nos}"
                </p>
              </div>
            )}
          </div>

          {/* Coluna da Direita: Card de Ação */}
          <div className="lg:col-span-5">
            <div className="md:sticky md:top-24 bg-gradient-to-b from-white/[0.07] to-transparent backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h3 className="text-xl md:text-2xl font-black mb-8 text-white uppercase italic">
                Vantagens <span className="text-emerald-500 block text-4xl">Exclusivas</span>
              </h3>

              <ul className="space-y-5">
                {beneficios.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'}
                target="_blank"
                className="mt-12 w-full flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl text-base md:text-lg uppercase transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                GARANTIR AGORA 🚀
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.5em] font-bold">
          © 2026 DINIZ <span className="text-emerald-500">DEV</span> // SISTEMA PRIVADO
        </p>
      </footer>

    </main>
  );
                                     }
      
