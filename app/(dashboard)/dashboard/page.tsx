'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'; // Jeito moderno
import { useRouter } from 'next/navigation';

// Criando o cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login'); // Se não tiver sessão, manda pro login
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

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
      {/* Header da Dashboard */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-black italic tracking-tighter">
          DINIZ<span className="text-blue-500">DEV</span> <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded ml-2 uppercase tracking-widest font-bold">PRO</span>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          Sair do Sistema
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user?.email?.split('@')[0]}</span> 🚀</h1>
          <p className="text-slate-400">Sua central de inteligência e criação de mini-sites.</p>
        </header>

        {/* Grid de Ferramentas */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card: Gerador de Mini-Site */}
          <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-3xl group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🌐</div>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">
              🚀
            </div>
            <h3 className="text-xl font-bold mb-2">Gerador de Mini-Site</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">A IA vai criar o código completo da sua página de vendas com botão de WhatsApp.</p>
            <button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
              Criar Agora
            </button>
          </div>

          {/* Card: Histórico */}
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold mb-2 text-slate-300">Minhas Estratégias</h3>
            <p className="text-sm text-slate-500 mb-6">Histórico de todas as análises de nicho geradas.</p>
            <div className="text-[10px] font-bold text-slate-600 border border-slate-800 rounded px-2 py-1 inline-block uppercase tracking-widest">
              Em Breve
            </div>
          </div>

          {/* Card: Suporte */}
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold mb-2 text-slate-300">Mentoria VIP</h3>
            <p className="text-sm text-slate-500 mb-6">Fale com nossa IA treinada para fechamento de vendas.</p>
            <div className="text-[10px] font-bold text-slate-600 border border-slate-800 rounded px-2 py-1 inline-block uppercase tracking-widest">
              Em Breve
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}