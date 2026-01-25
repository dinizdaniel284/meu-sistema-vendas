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

  if (!siteData) return <div className="p-10 text-white">Nenhum site gerado ainda.</div>;

  // 🛡️ REDE DE SEGURANÇA: Tenta pegar os dados da raiz ou de dentro de 'site'
  const dados = siteData.site || siteData;
  const { headline, subheadline, guia_completo, beneficios, sobre_nos, imagem, whatsapp } = dados;
  
  // 🔗 BUSCA DO SLUG: Se não achar 'slug', tenta a 'url' ou um fallback
  const slugFinal = siteData.slug || dados.slug || siteData.url?.split('/').pop();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Modo Visualização</span>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all">
            PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
        <img src={imagem} className="w-full h-[400px] object-cover rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" alt="Banner" />
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">{headline}</h1>
          <p className="text-xl text-slate-400 italic font-medium">{subheadline}</p>
        </div>

        <section className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-500 italic uppercase">Descrição</h2>
            <div className="space-y-3 text-slate-300 leading-relaxed text-lg">
              {guia_completo?.split('\n').map((par: string, i: number) => <p key={i}>{par}</p>)}
            </div>
          </div>
          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-black mb-6 uppercase text-emerald-400">Destaques</h2>
            <ul className="space-y-4">
              {beneficios?.map((b: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                  <span className="text-emerald-500">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="text-center mt-12 border-t border-white/10 pt-10">
          {/* ✅ RESOLUÇÃO DO 404: Se slugFinal for undefined, ele não deixa o link quebrado */}
          {slugFinal ? (
            <a
              href={`/s/${encodeURIComponent(slugFinal)}`}
              target="_blank"
              className="inline-block bg-emerald-600 px-10 py-5 rounded-2xl font-black uppercase hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
            >
              PUBLICAR E VER ONLINE 🌐
            </a>
          ) : (
            <p className="text-red-400 text-xs font-bold uppercase italic">Aguardando processamento do link...</p>
          )}
        </div>
      </div>
    </div>
  );
          }
