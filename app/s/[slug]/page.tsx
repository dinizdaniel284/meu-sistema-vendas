'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SitePage({ params }: { params: { slug: string } }) {
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    async function fetchSite() {
      const { data } = await supabase
        .from('sites')
        .select('*')
        .eq('slug', params.slug)
        .single();
      setSite(data);
    }
    fetchSite();
  }, [params.slug]);

  if (!site) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="mt-4 text-emerald-500 text-xs font-black uppercase tracking-widest animate-pulse">Carregando Experiência...</p>
      </div>
    );
  }

  const { conteudo } = site;
  
  // Limpa o WhatsApp (remove espaços, traços, etc)
  const waNumber = conteudo.whatsapp?.replace(/\D/g, '');

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {conteudo.imagem && (
          <div className="absolute inset-0 z-0">
            <img src={conteudo.imagem} className="w-full h-full object-cover scale-105" alt="Background" />
            {/* Overlay mais denso para garantir leitura */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/90 to-[#020617]" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
             <span className="text-emerald-400 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                ⚡ Disponibilidade Limitada
             </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
            {conteudo.headline}
          </h1>

          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {conteudo.subheadline}
          </p>
          
          {/* Seta indicativa para scroll */}
          <div className="pt-10 animate-bounce opacity-30">
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500 to-transparent mx-auto rounded-full" />
          </div>
        </div>
      </section>

      {/* SEÇÃO DE CONTEÚDO / SOBRE */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-1 gap-12">
          <div className="space-y-8">
            <h2 className="text-emerald-500 font-black text-xs tracking-[0.4em] uppercase flex items-center gap-4">
              <span className="w-8 h-[1px] bg-emerald-500" /> A Proposta
            </h2>
            
            <div className="space-y-6 text-slate-300 leading-relaxed text-lg md:text-xl">
              {conteudo.guia_completo?.split('\n').map((p: string, i: number) => (
                <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:text-emerald-500">{p}</p>
              ))}
            </div>
          </div>

          {/* BOX DE BENEFÍCIOS (Se existirem no JSON) */}
          {conteudo.beneficios && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] mt-10">
              <h3 className="text-white font-black uppercase italic mb-6">Por que escolher:</h3>
              <ul className="grid gap-4">
                {(Array.isArray(conteudo.beneficios) ? conteudo.beneficios : [conteudo.beneficios]).map((b: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CTA FIXO / FINAL */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-50 md:relative md:bottom-0 md:pb-24">
        <a 
          href={`https://wa.me/${waNumber}?text=Olá! Gostaria de saber mais sobre ${conteudo.headline}`}
          target="_blank"
          className="group block w-full md:max-w-md mx-auto bg-emerald-500 hover:bg-emerald-400 text-black text-center py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95"
        >
          Quero Garantir Agora
          <span className="block text-[8px] opacity-60 font-medium">Link seguro para WhatsApp</span>
        </a>
      </div>

      {/* FOOTER DISCRETO */}
      <footer className="py-20 text-center opacity-20 group">
        <p className="text-[10px] uppercase font-bold tracking-[0.5em]">
          Powered by <span className="text-emerald-500">DinizDev IA</span>
        </p>
      </footer>
    </main>
  );
                                                                                             }
