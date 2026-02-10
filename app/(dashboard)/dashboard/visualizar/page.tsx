'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VisualizarSlugPage() {
  const params = useParams();
  const slug = params.slug;
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error(error);
        setSiteData(null);
      } else {
        setSiteData(data);
      }
      setLoading(false);
    };

    fetchSite();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Carregando...
    </div>
  );

  if (!siteData) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Site não encontrado
    </div>
  );

  const conteudo = siteData.conteudo || {};
  const headline = conteudo.headline || "Produto Incrível";
  const subheadline = conteudo.subheadline || "Qualidade garantida";
  const beneficios = Array.isArray(conteudo.beneficios) ? conteudo.beneficios : [];
  const imagem = conteudo.imagem || '/default-image.jpg';
  const waNumber = conteudo.whatsapp || '';

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-4 md:p-10 font-sans">
      {/* CONTAINER */}
      <div className="max-w-3xl w-full space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">

        {/* IMAGEM */}
        <div className="w-full h-56 md:h-80 overflow-hidden rounded-xl">
          <img
            src={imagem}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* HEADLINE */}
        <h1 className="text-2xl md:text-4xl font-black text-center leading-snug">
          {headline}
        </h1>

        {/* SUBHEADLINE */}
        <p className="text-slate-400 text-sm md:text-base text-center">
          {subheadline}
        </p>

        {/* BENEFÍCIOS */}
        {beneficios.length > 0 && (
          <ul className="space-y-2 text-sm text-slate-300">
            {beneficios.map((b: string, i: number) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        )}

        {/* CTA WhatsApp */}
        {waNumber && (
          <a
            href={`https://wa.me/${waNumber.replace(/\D/g, '')}?text=Olá! Quero saber mais sobre ${encodeURIComponent(headline)}`}
            target="_blank"
            className="block text-center bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors"
          >
            Entrar em Contato
          </a>
        )}

        {/* LINK direto para o site final */}
        <a
          href={`/s/${siteData.slug}`}
          target="_blank"
          className="block text-center text-emerald-400 underline mt-2 text-sm"
        >
          Visualizar link final
        </a>

      </div>

      {/* FOOTER */}
      <footer className="py-8 text-center opacity-30 text-[10px]">
        Powered by <span className="text-emerald-500">DinizDev IA</span>
      </footer>
    </main>
  );
}