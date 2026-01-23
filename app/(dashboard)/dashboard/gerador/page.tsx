'use client';
import { useState, useEffect } from 'react';
// 1. IMPORTAÇÃO MODERNA RESOLVIDA
import { createBrowserClient } from '@supabase/ssr';

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  
  // 2. CLIENTE SUPABASE AJUSTADO (SEM ALERTA)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. FUNÇÃO PARA COPIAR O LINK PRO CLIPBOARD
  const copiarLink = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado! Pronto para enviar no WhatsApp. 🚀");
  };

  async function carregarSites() {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar sites:", error);
    } else {
      setMeusSites(data || []);
    }
  }

  useEffect(() => {
    carregarSites();
  }, []);

  async function gerarKitVendas() {
    if (!produto || !whatsapp) return alert("Preencha o produto e o zap, irmão!");
    
    setGerando(true);
    try {
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setResultado(data);
        carregarSites(); 
      } else {
        alert("Erro ao gerar. Tenta de novo!");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Tem certeza que deseja apagar este site?")) return;

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (!error) {
      carregarSites();
      if (resultado?.id === id) setResultado(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic uppercase tracking-tighter">
            DINIZ DEV IA
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold">Dashboard Profissional</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* PAINEL DE CRIAÇÃO */}
          <div className="lg:col-span-1 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md h-fit">
            <h2 className="text-xl font-bold mb-4">🚀 Criar Novo Site</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase text-blue-400 mb-2">Produto</label>
              <input 
                type="text" 
                placeholder="Ex: Bolo de Pote Gourmet"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm text-white transition-all"
                onChange={(e) => setProduto(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-blue-400 mb-2">WhatsApp</label>
              <input 
                type="text" 
                placeholder="Ex: 11999999999"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm text-white transition-all"
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <button 
              onClick={gerarKitVendas}
              disabled={gerando}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black uppercase text-xs transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {gerando ? '🧠 PROCESSANDO...' : 'GERAR SITE AGORA'}
            </button>
          </div>

          {/* LISTA DE SITES COM COPIAR E DELETAR */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-300">
              📂 Meus Mini-Sites <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{meusSites.length}</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {meusSites.map((site) => (
                <div key={site.id} className="relative bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-all group overflow-hidden">
                  <img src={site.conteudo.imagem} className="w-16 h-16 rounded-xl object-cover shadow-lg" alt="Preview" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate pr-6">{site.conteudo.headline}</h3>
                    <p className="text-[10px] text-slate-500 mb-2 truncate">/s/{site.slug}</p>
                    
                    <div className="flex gap-2">
                      <a 
                        href={`/s/${site.slug}`} 
                        target="_blank"
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black py-1.5 px-3 rounded-lg transition-all"
                      >
                        ABRIR ↗
                      </a>
                      <button 
                        onClick={() => copiarLink(site.slug)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-black py-1.5 px-3 rounded-lg transition-all"
                      >
                        COPIAR LINK 🔗
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deletarSite(site.id)}
                    className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}