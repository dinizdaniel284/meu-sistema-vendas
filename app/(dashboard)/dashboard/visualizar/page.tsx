'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    // Pegamos os dados que salvamos temporariamente no navegador
    const data = localStorage.getItem('last_generated_site');
    if (data) setSiteData(JSON.parse(data));
  }, []);

  if (!siteData) return <div className="p-10 text-white">Carregando site...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Barra de Ferramentas do Topo (Apenas para o dono do site) */}
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center no-print">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Modo Visualização Profissional</span>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold">Salvar PDF / Imprimir</button>
      </div>

      {/* RENDERIZAÇÃO DO SITE DA IA */}
      <div className="max-w-4xl mx-auto py-20 px-6">
         <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
            <img src={siteData.imagem} className="w-full h-[400px] object-cover" alt="Banner do Produto" />
         </div>
         
         <h1 className="text-5xl font-black mb-6 text-center">{siteData.headline}</h1>
         <p className="text-xl text-slate-400 text-center mb-12 leading-relaxed">{siteData.copy}</p>

         {/* O código HTML que a IA gerou entra aqui */}
         <div dangerouslySetInnerHTML={{ __html: siteData.html }} />
      </div>
    </div>
  );
}