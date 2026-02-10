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
        <p className="mt-4 text-emerald-500 text-xs font-black uppercase tracking-widest animate-pulse">
          Carregando Experiência...
        </p>
      </div>
    );
  }

  const { conteudo } = site || {};
  const waNumber = conteudo?.whatsapp?.replace(/\D/g, '') || '';

  const beneficiosRaw = conteudo?.beneficios || [];
  const beneficios = Array.isArray(beneficiosRaw)
    ? beneficiosRaw
    : typeof beneficiosRaw === 'string'
      ? beneficiosRaw.split(',').map((b: string) => b.trim())
      : [];

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">

      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
        {conteudo?.imagem && (
          <div className="absolute inset-0 z-0">
            <img
              src={conteudo.imagem}
              className="w-full h-full object-cover scale-105"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/90 to-[#020617]" />
          </div>
        )}

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="text-emerald-400 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase">
              ⚡ Disponibilidade Limitada
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
            {conteudo?.headline || 'Produto Incrível'}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {conteudo?.subheadline || 'A melhor solução para você.'}
          </p>

          <div className="pt-6 animate-bounce opacity-30">
            <div className="w-1 h-10 bg-gradient-to-b from-emerald-500 to-transparent mx-auto rounded-full" />
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-16 px-4 max-w-4xl mx-auto border-t border-white/5">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-emerald-500 font-black text-[10px] tracking-[0.4em] uppercase flex items-center gap-4">
              <span className="w-8 h-[1px] bg-emerald-500" /> A Proposta
            </h2>

            <div className="space-y-5 text-slate-300 leading-relaxed text-sm sm:text-base md:text-lg">
              {conteudo?.guia_completo
                ? conteudo.guia_completo.split('\n').map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))
                : <p className="italic text-slate-500">Descrição em geração...</p>
              }
            </div>
          </div>

          {beneficios.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl">
              <h3 className="text-white font-black uppercase italic mb-6 text-sm">
                Por que escolher:
              </h3>
              <ul className="grid gap-4">
                {beneficios.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CTA FIXO */}
      <div className="fixed bottom-4 left-0 w-full px-4 z-50 md:static md:pb-20">
        <a
          href={`https://wa.me/${waNumber}?text=Olá! Gostaria de saber mais sobre ${encodeURIComponent(conteudo?.headline || 'o produto')}`}
          target="_blank"
          className="block w-full md:max-w-md mx-auto bg-emerald-500 hover:bg-emerald-400 text-black text-center py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 text-sm"
        >
          Quero Garantir Agora
          <span className="block text-[10px] opacity-70 font-medium mt-1">
            Link seguro para WhatsApp
          </span>
        </a>
      </div>

      {/* FOOTER */}
      <footer className="py-16 text-center opacity-30">
        <p className="text-[10px] uppercase font-bold tracking-[0.4em]">
          Powered by <span className="text-emerald-500">DinizDev IA</span>
        </p>
      </footer>
    </main>
  );
}