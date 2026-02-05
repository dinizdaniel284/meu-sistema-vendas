'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Estado de loading explícito

  useEffect(() => {
    // Garantir que roda apenas no cliente
    const loadData = () => {
      try {
        const data = localStorage.getItem('last_generated_site');
        if (data) {
          const parsed = JSON.parse(data);
          setSiteData(parsed);
        }
      } catch (e) {
        console.error("Erro ao ler dados do site", e);
      } finally {
        setLoading(false); // Desliga o loading indepedente de achar ou não
      }
    };

    loadData();
  }, []);

  // 1. Se ainda está lendo o localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-blue-500 text-4xl">🌀</div>
          <p className="text-white font-bold italic">Buscando seu novo site...</p>
        </div>
      </div>
    );
  }

  // 2. Se terminou de carregar e não achou nada (Evita o loop infinito)
  if (!siteData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-red-500 font-black italic text-2xl uppercase mb-4">Nenhum site encontrado</h2>
        <p className="text-zinc-400 max-w-md mb-8">Não localizamos nenhum rastro do site gerado no seu navegador. Volte e gere novamente.</p>
        <a href="/gerador" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm">Voltar ao Gerador</a>
      </div>
    );
  }

  // 🛡️ Extração Tolerante
  const dados = siteData.site || siteData;
  const conteudo = dados.conteudo || dados;

  const headline = conteudo.headline || "Produto Incrível";
  const subheadline = conteudo.subheadline || "Qualidade garantida para você.";
  const guia_completo = conteudo.guia_completo || "";
  
  const beneficiosRaw = conteudo.beneficios || [];
  const beneficios = Array.isArray(beneficiosRaw) 
    ? beneficiosRaw 
    : typeof beneficiosRaw === 'string' 
      ? beneficiosRaw.split(',').map((b: string) => b.trim())
      : [];

  const imagem = conteudo.imagem || `https://loremflickr.com/1080/720/${encodeURIComponent(headline.split(' ')[0])}`;
  const slugFinal = siteData.slug || dados.slug || (siteData.url ? siteData.url.split('/').pop() : "");

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="bg-zinc-900/90 border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">
            Vexus AI <span className="text-blue-500">Preview</span>
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase"
        >
          Salvar Layout
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
        <div className="relative group">
          <img
            src={imagem}
            className="w-full h-[450px] object-cover rounded-[40px] shadow-2xl border border-white/10 transition-transform duration-700 group-hover:scale-[1.01]"
            alt="Banner"
          />
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl text-blue-400 italic font-medium max-w-2xl mx-auto">
            {subheadline}
          </p>
        </div>

        <section className="grid md:grid-cols-2 gap-12 pt-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
              <span className="w-10 h-1 bg-blue-600" /> Sobre
            </h2>
            <div className="text-slate-400 leading-relaxed text-lg space-y-4">
              {guia_completo ? guia_completo.split('\n').map((par: string, i: number) => (
                <p key={i}>{par}</p>
              )) : <p className="italic">Gerando descrição...</p>}
            </div>
          </div>

          <div className="bg-zinc-900/30 p-10 rounded-[35px] border border-white/5 backdrop-blur-sm h-fit">
            <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-emerald-500 italic">
              Vantagens
            </h2>
            <ul className="space-y-5">
              {beneficios.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-4 text-slate-200">
                  <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full text-[10px] mt-1">✓</span>
                  <span className="font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="text-center mt-20 border-t border-white/5 pt-16">
          {slugFinal ? (
            <div className="space-y-6">
              <a
                href={`/s/${encodeURIComponent(slugFinal)}`}
                target="_blank"
                className="inline-block bg-white text-black px-12 py-6 rounded-2xl font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 text-xl"
              >
                PUBLICAR SITE AGORA 🚀
              </a>
            </div>
          ) : (
            <p className="text-red-400 text-xs font-bold uppercase italic">Aguardando link final...</p>
          )}
        </div>
      </div>
    </div>
  );
}
