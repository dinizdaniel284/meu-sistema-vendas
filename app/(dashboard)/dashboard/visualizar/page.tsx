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

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );

  if (!siteData)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Nada encontrado
      </div>
    );

  const dados = siteData.site || siteData;
  const conteudo = dados.conteudo || dados;

  const headline = conteudo.headline || 'Produto Incrível';
  const subheadline = conteudo.subheadline || 'Qualidade garantida';
  const beneficios: string[] = Array.isArray(conteudo.beneficios) ? conteudo.beneficios : [];

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {conteudo.imagem && (
          <img
            src={conteudo.imagem}
            className="w-full h-56 md:h-80 object-cover rounded-xl"
            alt="Banner"
          />
        )}

        <h1 className="text-2xl md:text-4xl font-black">{headline}</h1>

        <p className="text-slate-400 text-sm md:text-base">{subheadline}</p>

        {beneficios.length > 0 && (
          <ul className="space-y-2">
            {beneficios.map((b: string, i: number) => (
              <li key={i} className="text-sm text-slate-300">
                • {b}
              </li>
            ))}
          </ul>
        )}

        <a
          href={`/s/${dados.slug}`}
          target="_blank"
          className="block text-center bg-white text-black py-3 rounded-lg font-bold"
        >
          Publicar Site
        </a>
      </div>
    </div>
  );
}