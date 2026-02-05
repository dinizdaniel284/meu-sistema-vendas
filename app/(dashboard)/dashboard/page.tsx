'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meusSites, setMeusSites] = useState<any[]>([]);

  useEffect(() => {
    const checkUserAndFetchSites = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setMeusSites(data);
        }
      }
      setLoading(false);
    };

    checkUserAndFetchSites();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-emerald-500 animate-pulse font-black text-3xl tracking-tighter">
            DINIZ<span className="text-white">DEV</span>
          </div>
          <div className="w-24 h-1 bg-white/5 overflow-hidden rounded-full">
            <div className="w-full h-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30">
      {/* NAVBAR GLASS */}
      <nav className="backdrop-blur-md bg-black/20 border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter">
          DINIZ<span className="text-emerald-500">DEV</span>
          <span className="hidden sm:inline-block text-[10px] ml-3 text-slate-500 border border-white/10 px-2 py-1 rounded-md uppercase tracking-widest">
            Elite System
          </span>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="px-4 py-2 border border-red-500/20 text-red-500/70 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all tracking-widest"
        >
          Sair
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Bem-vindo, <br />
              <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {user?.email?.split('@')[0]}
              </span>
            </h1>
            <p className="text-slate-500 font-medium italic mt-4 text-lg">
              Gerencie seus <span className="text-white">{meusSites.length}</span> projetos ativos.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/gerador')}
            className="group relative px-10 py-6 bg-emerald-600 rounded-[24px] font-black text-lg uppercase tracking-tighter overflow-hidden transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
          >
            <span className="relative z-10">+ Criar Novo Projeto</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>

        {/* GRID DE SITES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meusSites.length > 0 ? meusSites.map((site) => (
            <div 
              key={site.id} 
              className="bg-white/[0.03] border border-white/5 group rounded-[40px] overflow-hidden hover:border-emerald-500/50 transition-all duration-500 shadow-2xl flex flex-col h-full hover:-translate-y-2"
            >
              {/* MINIATURA */}
              <div className="h-52 bg-black/40 relative overflow-hidden">
                {site.conteudo?.imagem ? (
                  <img 
                    src={site.conteudo.imagem} 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" 
                    alt="Preview" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-700 font-black uppercase text-[10px]">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
                <div className="absolute top-5 left-5">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em] backdrop-blur-md">
                    Ativo
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-black text-xl mb-2 truncate uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">
                  {site.conteudo?.headline || site.slug}
                </h3>
                <div className="flex items-center gap-2 mb-8">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">
                     /s/{site.slug}
                   </p>
                </div>
                
                <div className="mt-auto flex gap-3">
                  <Link 
                    href={`/s/${site.slug}`} 
                    target="_blank"
                    className="flex-1 text-center text-[11px] font-black uppercase bg-white text-black py-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all tracking-tighter"
                  >
                    Abrir Site
                  </Link>
                  <button 
                    onClick={() => router.push(`/dashboard/gerador?edit=${site.id}`)}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm group-hover:rotate-12 duration-300"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[50px]">
              <div className="text-5xl mb-4 opacity-20 grayscale">🚀</div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sua lista de projetos está vazia.</p>
              <button 
                onClick={() => router.push('/dashboard/gerador')}
                className="mt-4 text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                Criar meu primeiro site agora
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
              }
      
