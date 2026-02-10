'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('last_generated_site');
    if (data) setSiteData(JSON.parse(data));
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>;
  if (!siteData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Nada encontrado</div>;

  const dados = siteData.site || siteData;
  const conteudo = dados.conteudo || dados;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <img src={conteudo.imagem} className="w-full h-56 md:h-80 object-cover rounded-xl" alt="Banner" />
        <h1 className="text-2xl md:text-4xl font-black">{conteudo.headline || "Produto Incrível"}</h1>
        <p className="text-slate-400">{conteudo.subheadline || "Qualidade garantida"}</p>
        <ul className="space-y-2">{Array.isArray(conteudo.beneficios) && conteudo.beneficios.map((b, i) => <li key={i} className="text-sm text-slate-300">• {b}</li>)}</ul>
        <a href={`/s/${dados.slug}`} target="_blank" className="block text-center bg-white text-black py-3 rounded-lg font-bold">Publicar Site</a>
      </div>
    </div>
  );
}