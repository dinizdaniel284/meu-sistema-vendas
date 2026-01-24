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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between">
        <span className="text-xs font-bold text-blue-400 uppercase">
          Visualização
        </span>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold"
        >
          Salvar PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6">
        <img
          src={siteData.imagem}
          className="w-full h-[400px] object-cover rounded-2xl mb-8"
          alt="Banner"
        />

        <h1 className="text-4xl font-black mb-6 text-center">
          {siteData.headline}
        </h1>

        <p className="text-xl text-slate-400 text-center mb-12">
          {siteData.copy}
        </p>

        <div dangerouslySetInnerHTML={{ __html: siteData.html }} />
      </div>
    </div>
  );
}