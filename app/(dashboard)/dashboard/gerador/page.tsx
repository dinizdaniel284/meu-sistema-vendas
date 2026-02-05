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
    // 🛡️ TRAVA TOTAL: Se já estiver gerando ou os campos estiverem vazios, não faz nada
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
        setProduto(''); // Limpa o campo para evitar re-envio acidental
        await carregarSites(); // Atualiza a lista para ver o novo
        alert("Site gerado com sucesso! 🚀");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGerando(false);
    }
  }

  // 🗑️ FUNÇÃO PARA MATAR OS CLONES
  async function deletarSite(id: string) {
    if (!confirm("Deseja mesmo apagar este projeto?")) return;
    
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (!error) {
      setMeusSites(prev => prev.filter(s => s.id !== id));
    } else {
      alert("Erro ao deletar. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">
            DINIZ<span className="text-white">DEV</span> IA
          </h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-[10px] bg-white/5 border border-white/10 px-6 py-2 rounded-full hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
          >
            Voltar Painel
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FORMULÁRIO */}
          <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 h-fit backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6 italic">Novo Projeto</h2>
            <div className="space-y-4">
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white"
                placeholder="O que você vende?"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              />
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 transition-all text-white"
                placeholder="WhatsApp (ex: 11999999999)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <button
                onClick={gerarKitVendas}
                disabled={gerando}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all ${
                  gerando ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.3)]'
                }`}
              >
                {gerando ? '🧠 PROCESSANDO...' : 'CRIAR LANDING PAGE'}
              </button>
            </div>
          </div>

          {/* LISTAGEM COM BOTÃO DE EXCLUIR */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold mb-6 text-slate-500 uppercase tracking-[0.3em]">
              SEUS PROJETOS ({meusSites.length})
            </h2>
            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {meusSites.length === 0 ? (
                <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center text-slate-600 italic">
                  Nenhum projeto encontrado.
                </div>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                    <div className="truncate pr-4">
                      <p className="text-xs font-black uppercase truncate text-slate-200 group-hover:text-white">
                        {site.conteudo?.headline || 'Landing Page Sem Título'}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono mt-1 italic">/s/{site.slug}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => deletarSite(site.id)}
                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
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
          
