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

  if (!site) return <div className="min-h-screen bg-[#020617] flex items-center justify-center">Carregando...</div>;

  const { conteudo } = site;

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* HERO SECTION - Ajustada para Mobile */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center">
        {conteudo.imagem && (
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={conteudo.imagem} className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/10 via-[#020617]/80 to-[#020617]" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-emerald-400 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-4 block">
            Oportunidade Exclusiva
          </span>
          
          {/* AJUSTE DE FONTE AQUI: text-3xl no mobile, text-7xl no desktop */}
          <h1 className="text-3xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-6">
            {conteudo.headline}
          </h1>

          <p className="text-sm md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {conteudo.subheadline}
          </p>
        </div>
      </section>

      {/* SEÇÃO DE EXPERIÊNCIA - Ajustada para não embolar */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-emerald-500 font-black text-xs md:text-sm tracking-[0.4em] uppercase mb-8">
          A Experiência
        </h2>
        
        {/* Espaçamento entre parágrafos corrigido */}
        <div className="space-y-6 text-slate-400 leading-relaxed text-base md:text-lg italic">
          {conteudo.guia_completo?.split('\n').map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* CTA FIXO NO MOBILE */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-50 md:relative md:bottom-0 md:mb-20">
        <a 
          href={`https://wa.me/${conteudo.whatsapp}`}
          className="block w-full md:max-w-md mx-auto bg-blue-600 hover:bg-blue-500 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
        >
          Quero Garantir Agora
        </a>
      </div>
    </main>
  );
      }
        
