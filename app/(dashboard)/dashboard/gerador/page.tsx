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

  // 1. CARREGAR OS SITES (Para você poder deletar os clones)
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

  // 2. FUNÇÃO DE GERAR COM TRAVA ANTI-LOOP
  async function gerarKitVendas() {
    if (!produto || !whatsapp || gerando) return; // BLOQUEIO DUPLO

    setGerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp, userId: user?.id }),
      });

      if (response.ok) {
        setProduto(''); // Limpa o campo pra evitar re-envio
        await carregarSites(); // Atualiza a lista
        alert("Site gerado com sucesso! 🚀");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGerando(false);
    }
  }

  // 3. FUNÇÃO DE DELETAR (Para limpar a bagunça)
  async function deletarSite(id: string) {
    if (!confirm("Apagar este clone?")) return;
    await supabase.from('sites').delete().eq('id', id);
    setMeusSites(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black italic text-emerald-500 uppercase">DINIZDEV IA</h1>
          <button onClick={() => router.push('/dashboard')} className="text-[10px] border border-white/10 px-4 py-2 rounded-full hover:bg-white/5">Voltar Painel</button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LADO ESQUERDO: FORMULÁRIO */}
          <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 h-fit backdrop-blur-md">
            <h2 className="text-lg font-bold mb-4">Novo Projeto</h2>
            <div className="space-y-4">
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 transition-all"
                placeholder="O que você vende?"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              />
              <input
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 transition-all"
                placeholder="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <button
                onClick={gerarKitVendas}
                disabled={gerando}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                  gerando ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {gerando ? '🧠 GERANDO...' : 'CRIAR LANDING PAGE'}
              </button>
            </div>
          </div>

          {/* LADO DIREITO: LISTA PARA LIMPAR A BAGUNÇA */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold mb-4 text-slate-500 uppercase tracking-widest">Seus Projetos ({meusSites.length})</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {meusSites.map((site) => (
                <div key={site.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                  <div className="truncate pr-4">
                    <p className="text-xs font-bold uppercase truncate">{site.conteudo?.headline || site.slug}</p>
                    <p className="text-[9px] text-slate-500 font-mono">/s/{site.slug}</p>
                  </div>
                  <button 
                    onClick={() => deletarSite(site.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs"
                  >
                    Excluir
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
