'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoadingGerador from '@/app/components/LoadingGerador'; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  const router = useRouter();

  async function carregarSites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMeusSites(data || []);
  }

  useEffect(() => { carregarSites(); }, []);

  async function gerarKitVendas() {
    if (gerando || !produto || !whatsapp) return; 

    setGerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp, userId: user?.id }),
      });

      if (response.ok) {
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        alert("Site gerado com sucesso! 🚀");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Deseja mesmo apagar este projeto?")) return;
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (!error) {
      setMeusSites(prev => prev.filter(s => s.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 overflow-x-hidden">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-xl md:text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">
            DINIZ<span className="text-white">DEV</span> IA
          </h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-[10px] bg-white/5 border border-white/10 px-4 md:px-6 py-2 rounded-full hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
          >
            PAINEL
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FORMULÁRIO - Ajustado para Celular */}
          <div className="bg-white/5 p-6 md:p-8 rounded-[32px] border border-white/10 h-fit backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg md:text-xl font-bold mb-6 italic">Novo Projeto</h2>
            <div className="space-y-4">
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white text-sm"
                placeholder="O que você vende?"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              />
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white text-sm"
                placeholder="WhatsApp (ex: 11999999999)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <button
                onClick={gerarKitVendas}
                disabled={gerando}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all ${
                  gerando ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {gerando ? '🧠 PROCESSANDO...' : 'CRIAR LANDING PAGE'}
              </button>
            </div>
          </div>

          {/* LISTAGEM COM PREVIEW E LINK FUNCIONAL */}
          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-bold mb-6 text-slate-500 uppercase tracking-[0.3em]">
              SEUS PROJETOS ({meusSites.length})
            </h2>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {meusSites.length === 0 ? (
                <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-600 italic text-sm">
                  Nenhum projeto encontrado.
                </div>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center group hover:bg-white/[0.04] transition-all">
                    
                    <div className="flex items-center gap-4 w-full md:w-auto truncate">
                      {/* MINI PREVIEW DA IMAGEM */}
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-white/10">
                        {site.conteudo?.imagem ? (
                          <img src={site.conteudo.imagem} className="w-full h-full object-cover" alt="IA" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600">IA</div>
                        )}
                      </div>

                      <div className="truncate">
                        <p className="text-[11px] font-black uppercase truncate text-slate-200">
                          {site.conteudo?.headline || 'Landing Page'}
                        </p>
                        <a 
                          href={`/s/${site.slug}`} 
                          target="_blank" 
                          className="text-[9px] text-emerald-500 font-mono hover:underline flex items-center gap-1 mt-1 uppercase"
                        >
                          Ver Site Gerado ↗
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => deletarSite(site.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                    }
