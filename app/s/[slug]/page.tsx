'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SitePage() {
  const params = useParams();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSite() {
      try {
        const { data } = await supabase
          .from('sites')
          .select('*')
          .eq('slug', params.slug)
          .single();

        setSite(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black">
      Carregando site...
    </div>
  );

  if (!site) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-500 font-black">
      Site não encontrado
    </div>
  );

  const { conteudo } = site || {};
  const waNumber = conteudo?.whatsapp?.replace(/\D/g, '') || '';
  const beneficiosRaw = conteudo?.beneficios || [];
  const beneficios = Array.isArray(beneficiosRaw)
    ? beneficiosRaw
    : typeof beneficiosRaw === 'string'
      ? beneficiosRaw.split(',').map((b: string) => b.trim())
      : [];

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
        {conteudo?.imagem && (
          <div className="absolute inset-0 z-0">
            {/* 🔒 Reservando espaço fixo da imagem */}
            <img
              src={conteudo.imagem}
              alt="Background"
              className="w-full h-full object-cover"
              loading="eager"
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
        </div>
      </section>

      {/* BENEFÍCIOS */}
      {beneficios.length > 0 && (
        <section className="py-12 px-4 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4">
            <h2 className="text-emerald-500 font-black uppercase text-sm tracking-[0.4em]">Por que escolher</h2>
            <ul className="grid gap-3">
              {beneficios.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 🔒 Espaço reservado pro CTA (evita pulo) */}
      <div className="h-24 md:hidden" />

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
