'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('last_generated_site');
    if (data) setSiteData(JSON.parse(data));
  }, []);

  if (!siteData) return <div className="p-10 text-white">Nenhum site gerado ainda.</div>;

  const { headline, subheadline, guia_completo, beneficios, sobre_nos, imagem, whatsapp, slug } = siteData;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center">
        <span className="text-xs font-bold text-blue-400 uppercase">Pré-visualização</span>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold">Salvar PDF</button>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
        <img src={imagem} className="w-full h-[400px] object-cover rounded-2xl shadow-2xl" alt="Banner" />
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black">{headline}</h1>
          <p className="text-xl text-slate-400">{subheadline}</p>
        </div>

        <section className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Guia</h2>
            <div className="space-y-3 text-slate-300">
              {guia_completo?.split('\n').map((par: string, i: number) => <p key={i}>{par}</p>)}
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-4">Destaques</h2>
            <ul className="space-y-2 text-slate-300">
              {beneficios?.map((b: string, i: number) => <li key={i} className="flex gap-2"><span>•</span>{b}</li>)}
            </ul>
          </div>
        </section>

        <div className="text-center mt-12 border-t border-white/10 pt-10">
          {/* ✅ Correção do 404: encodeURIComponent garante que o link funcione mesmo com espaços */}
          <a
            href={`/s/${encodeURIComponent(slug)}`}
            target="_blank"
            className="inline-block bg-emerald-600 px-8 py-4 rounded-xl font-black uppercase hover:bg-emerald-500 transition-all shadow-lg"
          >
            VER SITE NO AR 🌐
          </a>
        </div>
      </div>
    </div>
  );
            }
