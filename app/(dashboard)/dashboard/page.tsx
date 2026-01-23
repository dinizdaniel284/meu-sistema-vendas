'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para a nova funcionalidade de IA
  const [produto, setProduto] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Função para chamar sua API gratuita
  async function handleGerarSite() {
    if (!produto) return alert("Digite o que você quer vender!");
    
    setGerando(true);
    setResultado(null); // Limpa o anterior

    try {
      const res = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          produto: produto, 
          whatsapp: '5500000000000' // Depois você pode pegar isso de um input
        }),
      });

      if (!res.ok) throw new Error();
      
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      alert("Erro ao conectar com a IA. Verifique se a rota /api/gerar-site existe.");
    } finally {
      setGerando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-500 animate-bounce font-black italic text-2xl">
          DINIZ<span className="text-white">DEV</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-black italic tracking-tighter">
          DINIZ<span className="text-blue-500">DEV</span> <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-2 uppercase tracking-widest font-bold">PRO</span>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          Sair
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user?.email?.split('@')[0]}</span> 🚀
          </h1>
          <p className="text-slate-400">Sua central de inteligência e criação de mini-sites.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card: Gerador de Mini-Site (Ajustado) */}
          <div className="md:col-span-2 p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-3xl group hover:border-blue-500/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🌐</div>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">🚀</div>
            
            <h3 className="text-xl font-bold mb-2">Gerador de Mini-Site IA</h3>
            <p className="text-sm text-slate-400 mb-6">Digite o produto e a IA criará a copy e a imagem de venda.</p>
            
            <div className="flex flex-col gap-4">
              <input 
                type="text"
                placeholder="Ex: Bolo de Pote, Mentoria de Marketing..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all"
              />
              
              <button 
                onClick={handleGerarSite}
                disabled={gerando}
                className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {gerando ? 'PROCESSANDO...' : 'CRIAR MEU SITE AGORA'}
              </button>
            </div>

            {/* Resultado da Geração */}
            {resultado && (
              <div className="mt-8 p-6 bg-white/[0.03] border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-[10px] text-blue-400 font-bold uppercase mb-4 tracking-widest">Preview do Mini-Site</p>
                <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img src={resultado.imagem} alt="IA Generated" className="w-full h-48 object-cover" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{resultado.headline}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{resultado.copy}</p>
                <div className="text-[10px] text-slate-500 italic">O código HTML completo foi gerado com sucesso.</div>
              </div>
            )}
          </div>

          {/* Cards Secundários */}
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
              <h3 className="text-lg font-bold mb-2 text-slate-300">Minhas Estratégias</h3>
              <p className="text-xs text-slate-500 mb-4">Histórico de nichos.</p>
              <span className="text-[9px] font-bold text-slate-600 border border-slate-800 rounded px-2 py-1 uppercase">Em Breve</span>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
              <h3 className="text-lg font-bold mb-2 text-slate-300">Mentoria VIP</h3>
              <p className="text-xs text-slate-500 mb-4">IA treinada para fechar vendas.</p>
              <span className="text-[9px] font-bold text-slate-600 border border-slate-800 rounded px-2 py-1 uppercase">Em Breve</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
