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
          <div className="text-emerald-500 animate-pulse font-black text-3xl tracking-tighter font-syne">
            DINIZ<span className="text-white">DEV</span>
          </div>
          <div className="w-24 h-1 bg-white/5 overflow-hidden rounded-full">
            <div className="w-full h-full bg-emerald-500 animate-progress-line" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* NAVBAR GLASS */}
      <nav className="glass border-b border-white/10 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter font-syne">
          DINIZ<span className="text-emerald-500">DEV</span><span className="text-[10px] ml-2 text-slate-500 border border-white/10 px-2 py-1 rounded-md uppercase">Elite</span>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="px-5 py-2 border border-red-500/20 text-red-500/70 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all tracking-widest"
        >
          Sair do Sistema
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8 animate-fade-in">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-syne">
              Seja bem-vindo, <br />
              <span className="text-emerald-500">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium italic mt-2 text-lg">
              Você possui {meusSites.length} projetos de alta conversão.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/gerador')}
            className="btn-luxury px-10 py-6 rounded-[24px] font-black text-lg uppercase tracking-tighter"
          >
            + Criar Novo Projeto
          </button>
        </div>

        {/* GRID DE SITES COM EFEITO GLASS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {meusSites.length > 0 ? meusSites.map((site) => (
            <div 
              key={site.id} 
              className="glass group rounded-[40px] overflow-hidden hover:border-emerald-500/50 transition-all duration-700 shadow-2xl flex flex-col h-full"
            >
              {/* MINIATURA */}
              <div className="h-56 bg-black/40 relative overflow-hidden">
                {site.conteudo?.imagem ? (
                  <img 
                    src={site.conteudo.imagem} 
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000" 
                    alt="Preview" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-800 font-black uppercase tracking-widest text-[10px]">Image Offline</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest backdrop-blur-md">
                    Live Now
                  </span>
                </div>
              </div>

              {/* INFO */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-black text-2xl mb-2 truncate uppercase italic tracking-tighter font-syne">
                  {site.conteudo?.headline || site.slug}
                </h3>
                <p className="text-emerald-500/60 text-[10px] font-mono mb-8 tracking-widest uppercase">
                  URL: /s/{site.slug}
                </p>
                
                <div className="mt-auto flex gap-3">
                  <Link 
                    href={`/s/${site.slug}`} 
                    target="_blank"
                    className="flex-1 text-center text-[11px] font-black uppercase bg-white text-black py-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all tracking-tighter"
                  >
                    Visualizar Site
                  </Link>
                  <button 
                    onClick={() => router.push(`/dashboard/gerador`)}
                    className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xl"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center glass rounded-[50px] border-dashed border-white/10">
              <div className="text-6xl mb-6 opacity-10">💎</div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Nenhum projeto de elite encontrado.</p>
              <button 
                onClick={() => router.push('/dashboard/gerador')}
                className="mt-6 text-emerald-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
              >
                Inicie sua jornada agora →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}