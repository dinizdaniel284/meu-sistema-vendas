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

      const result = await response.json();

      if (response.ok) {
        // Salva no localStorage para o preview ler imediatamente
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        
        // Redireciona para o preview
        router.push('/visualizar'); 
      } else {
        alert("Erro na API: " + (result.error || "Tente novamente"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar. Verifique sua conexão.");
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
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 overflow-x-hidden">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 md:mb-12">
          <h1 className="text-xl md:text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">
            DINIZ<span className="text-white">DEV</span> IA
          </h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
          >
            PAINEL
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
          {/* FORMULÁRIO */}
          <div className="bg-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/10 h-fit backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg md:text-xl font-bold mb-6 italic text-center md:text-left">Novo Projeto</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-2 block tracking-widest">O que você vende?</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white text-sm"
                  placeholder="Ex: Curso de Manutenção de Celular"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-2 block tracking-widest">WhatsApp de Vendas</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white text-sm"
                  placeholder="11999999999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <button
                onClick={gerarKitVendas}
                disabled={gerando}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-xs transition-all mt-4 ${
                  gerando ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95'
                }`}
              >
                {gerando ? '🧠 CRIANDO ESTRUTURA...' : 'GERAR SITE AGORA'}
              </button>
            </div>
          </div>

          {/* LISTAGEM */}
          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-bold mb-6 text-slate-500 uppercase tracking-[0.3em] text-center md:text-left">
              MEUS SITES <span className="text-white">({meusSites.length})</span>
            </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {meusSites.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center text-slate-600 italic text-sm">
                  Aguardando seu primeiro comando...
                </div>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center group hover:border-emerald-500/30 transition-all">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                      <div className="w-14 h-14 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-white/10">
                        {site.conteudo?.imagem ? (
                          <img src={site.conteudo.imagem} className="w-full h-full object-cover" alt="Preview IA" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600 uppercase">IA</div>
                        )}
                      </div>

                      <div className="truncate w-full">
                        <p className="text-xs font-black uppercase truncate text-white italic">
                          {site.conteudo?.headline || 'Landing Page Sem Título'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <a 
                              href={`/s/${site.slug}`} 
                              target="_blank" 
                              className="text-[10px] text-emerald-500 font-bold hover:text-emerald-400 transition-colors uppercase tracking-widest"
                            >
                              Acessar Site ↗
                            </a>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deletarSite(site.id)}
                      className="w-full sm:w-auto px-6 py-2 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl text-[9px] font-black uppercase transition-all"
                    >
                      Excluir
                    </button>
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
