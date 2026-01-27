'use client';
import { useEffect, useState } from 'react';

export default function VisualizarPage() {
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('last_generated_site');
    if (data) {
      try {
        setSiteData(JSON.parse(data));
      } catch (e) {
        console.error("Erro ao ler dados do site", e);
      }
    }
  }, []);

  if (!siteData) {
    return <div className="p-10 text-white">Nenhum site gerado ainda.</div>;
  }

  // 🛡️ Extração tolerante
  const dados = siteData.site || siteData;
  const conteudo = dados.conteudo || dados;

  const headline = conteudo.headline || conteudo.titulo || "Título do Site";
  const subheadline = conteudo.subheadline || conteudo.subtitulo || "";
  const guia_completo = conteudo.guia_completo || conteudo.descricao || "";
  const beneficios = Array.isArray(conteudo.beneficios) ? conteudo.beneficios : [];
  const imagem = conteudo.imagem || "https://via.placeholder.com/1080";
  const slugFinal = siteData.slug || dados.slug || siteData.url?.split('/').pop();
  const isFallback = conteudo.fallback;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest italic">
          Pré-visualização do Site
        </span>
        <button
          onClick={() => window.print()}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase"
        >
          Salvar PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">

        {isFallback && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl text-xs font-bold uppercase italic text-center">
            ⚠️ Conteúdo gerado sem IA (modo de segurança)
          </div>
        )}

        <img
          src={imagem}
          className="w-full h-[400px] object-cover rounded-3xl shadow-2xl border border-white/10"
          alt="Banner"
        />

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            {headline}
          </h1>
          <p className="text-xl text-slate-400 italic font-medium">
            {subheadline}
          </p>
        </div>

        <section className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-500 italic uppercase">
              Descrição
            </h2>
            <div className="text-slate-300 leading-relaxed text-lg space-y-3">
              {guia_completo ? (
                guia_completo.split('\n').map((par: string, i: number) => (
                  <p key={i}>{par}</p>
                ))
              ) : (
                <p className="text-slate-600">
                  Aguardando descrição da IA...
                </p>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-black mb-6 uppercase text-emerald-400">
              Destaques
            </h2>
            <ul className="space-y-4">
              {beneficios.length > 0 ? (
                beneficios.map((b: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-200 font-medium"
                  >
                    <span className="text-emerald-500 text-lg">✓</span> {b}
                  </li>
                ))
              ) : (
                <li className="text-slate-600 italic text-sm">
                  Nenhum destaque gerado.
                </li>
              )}
            </ul>
          </div>
        </section>

        <div className="text-center mt-12 border-t border-white/10 pt-10">
          {slugFinal ? (
            <a
              href={`/s/${encodeURIComponent(slugFinal)}`}
              target="_blank"
              className="inline-block bg-emerald-600 px-10 py-5 rounded-2xl font-black uppercase hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
            >
              ACESSAR SITE NO AR 🌐
            </a>
          ) : (
            <p className="text-red-400 text-xs font-bold uppercase italic">
              Erro: Link não encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
          }
