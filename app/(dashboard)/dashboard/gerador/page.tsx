'use client';
import { useState } from 'react';

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  async function gerarKitVendas() {
    if (!produto || !whatsapp) return alert("Preencha o produto e o zap, irmão!");
    
    setGerando(true);
    
    try {
      // Chamada para a sua API de inteligência
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setResultado(data);
        // SALVA O SITE NO NAVEGADOR PARA A PÁGINA DE VISUALIZAÇÃO LER
        localStorage.setItem('last_generated_site', JSON.stringify(data));
      } else {
        alert("Erro ao gerar. Tenta de novo!");
      }
    } catch (err) {
      alert("Erro de conexão com a IA.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent italic tracking-tighter">
            CONSTRUTOR INSANO IA
          </h1>
          <p className="text-slate-400 font-medium">Sua oferta profissional gerada por redes neurais em segundos.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PAINEL DE ENTRADA (INPUTS) */}
          <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl transition-all focus-within:border-blue-500/30">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">O que você quer vender?</label>
              <input 
                type="text" 
                placeholder="Ex: Mentoria de Vendas"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-white"
                onChange={(e) => setProduto(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Seu WhatsApp (com DDD)</label>
              <input 
                type="text" 
                placeholder="Ex: 11999999999"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-sm text-white"
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <button 
              onClick={gerarKitVendas}
              disabled={gerando}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {gerando ? '🧠 PROCESSANDO MODELO IA...' : '🚀 GERAR MEU KIT DE VENDAS'}
            </button>
          </div>

          {/* PAINEL DE RESULTADO (PREVIEW) */}
          <div className="bg-slate-900/40 border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {!resultado ? (
              <div className="opacity-20 animate-pulse">
                <div className="text-6xl mb-4">🧬</div>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase">Aguardando Processamento...</p>
              </div>
            ) : (
              <div className="w-full animate-fade-in space-y-4">
                {/* Preview da Imagem Gerada */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                    <img src={resultado.imagem} alt="Preview IA" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Imagem Única Gerada ✓</span>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{resultado.headline}</h4>
                    </div>
                </div>

                {/* Código/Copy Gerada */}
                <div className="bg-black/60 p-4 rounded-xl text-left border border-white/5">
                    <p className="text-[9px] text-blue-400 font-bold mb-2 uppercase tracking-widest">// ESTRUTURA HTML:</p>
                    <div className="text-[10px] text-slate-500 font-mono h-12 overflow-hidden italic">
                        {resultado.html}
                    </div>
                </div>

                {/* BOTÃO QUE ABRE A NOVA PÁGINA */}
                <button 
                  onClick={() => window.open('/dashboard/visualizar', '_blank')}
                  className="w-full py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
                >
                  Visualizar Mini-Site Full 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}