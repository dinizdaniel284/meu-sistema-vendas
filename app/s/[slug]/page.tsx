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
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans">

      {/* HERO */}
      <section className="relative min-h-screen md:min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={imagem}
            alt={headline}
            className="w-full h-full object-cover opacity-40 md:opacity-30 scale-105 md:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/95 to-[#020617]" />
        </div>

        <div className="relative z-10 max-w-5xl text-center pt-20">
          <span className="inline-block px-3 py-1 mb-6 text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-emerald-400 border border-emerald-500/30 rounded-full uppercase">
            Oportunidade Exclusiva
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tighter uppercase italic px-2">
            {headline}
          </h1>

          <p className="text-sm sm:text-base md:text-xl text-slate-300 font-light max-w-3xl mx-auto px-4">
            {subheadline}
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12">

          <div className="lg:col-span-7 space-y-10">
            <div>
              <h2 className="text-xs font-black text-emerald-500 tracking-[0.4em] uppercase mb-4">
                A Experiência
              </h2>

              <div className="text-slate-300 space-y-5 text-sm sm:text-base md:text-xl font-light leading-relaxed">
                {guia_completo
                  ? guia_completo.split('\n').map((p: string, i: number) => <p key={i}>{p}</p>)
                  : <p>Descubra um novo padrão de excelência.</p>
                }
              </div>
            </div>

            {sobre_nos && (
              <div className="p-6 md:p-8 border-l-2 border-emerald-500/30 bg-white/5 rounded-r-3xl">
                <h3 className="text-sm md:text-lg font-bold text-white mb-4 uppercase italic">
                  Nossa Autoridade
                </h3>
                <p className="text-slate-400 italic text-sm md:text-lg leading-relaxed">
                  {sobre_nos}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="md:sticky md:top-12 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-lg md:text-2xl font-black mb-6 text-white uppercase italic">
                Por que escolher <span className="text-emerald-500">Isto?</span>
              </h3>

              <ul className="space-y-4">
                {beneficios.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-sm md:text-lg text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#'}
                target="_blank"
                className="mt-10 flex justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 md:py-5 rounded-2xl text-base md:text-xl uppercase shadow-xl"
              >
                GARANTIR AGORA 🚀
              </a>
            </div>
          </div>

        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-[9px] md:text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black">
          © 2026 DINIZ <span className="text-emerald-500">DEV</span>
        </p>
      </footer>

    </main>
  );
}
