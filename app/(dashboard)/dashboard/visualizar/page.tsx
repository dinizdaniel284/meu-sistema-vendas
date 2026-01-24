'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('last_generated_site');
    if (data) setSiteData(JSON.parse(data));
  }, []);

  if (!siteData) {
    return <div className="p-10 text-white">Nenhum site gerado ainda.</div>;
  }

  const { headline, subheadline, guia_completo, beneficios, sobre_nos, imagem, whatsapp, slug } =
    siteData;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center">
        <span className="text-xs font-bold text-blue-400 uppercase">
          Visualização
        </span>

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=Olá! Quero saber mais sobre ${headline}.`}
            target="_blank"
            className="bg-green-600 px-4 py-2 rounded-lg text-xs font-bold"
          >
            Abrir WhatsApp
          </a>
        )}

        <button
          onClick={() => window.print()}
          className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold"
        >
          Salvar PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
        <img
          src={imagem}
          className="w-full h-[400px] object-cover rounded-2xl"
          alt="Banner"
        />

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black">{headline}</h1>
          {subheadline && <p className="text-xl text-slate-400">{subheadline}</p>}
        </div>

        {guia_completo && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Guia Completo</h2>
            <div className="space-y-3 text-slate-300">
              {guia_completo.split('\n').map((par: string, i: number) => (
                <p key={i}>{par}</p>
              ))}
            </div>
          </section>
        )}

        {beneficios && beneficios.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Benefícios</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              {beneficios.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        )}

        {sobre_nos && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Sobre Nós</h2>
            <p className="text-slate-300">{sobre_nos}</p>
          </section>
        )}

        <div className="text-center mt-12">
          <a
            href={`/s/${slug}`}
            target="_blank"
            className="inline-block bg-blue-600 px-6 py-4 rounded-xl font-black uppercase hover:bg-blue-500 transition-colors"
          >
            Abrir Página Gerada
          </a>
        </div>
      </div>
    </div>
  );
}
