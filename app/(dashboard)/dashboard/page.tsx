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
  const [meusSites, setMeusSites] = useState<any[]>([]); // Estado para guardar SÓ os meus sites

  useEffect(() => {
    const checkUserAndFetchSites = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        
        // O PULO DO GATO: Busca apenas os sites onde o user_id é o meu!
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', session.user.id) // Filtro de privacidade
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-black text-2xl tracking-tighter">
          DINIZ<span className="text-white">DEV</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/10 bg-black/20 px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-black">
          DINIZ<span className="text-emerald-500">DEV</span>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-all"
        >
          Sair do Sistema
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Olá, {user?.email?.split('@')[0]} 🚀</h1>
            <p className="text-gray-400 text-sm">Gerencie seus projetos gerados por IA.</p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/gerador')}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-4 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            + Criar Novo Site
          </button>
        </div>

        {/* LISTA DE SITES FILTRADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meusSites.length > 0 ? meusSites.map((site) => (
            <div key={site.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-emerald-500/50 transition-all">
              <h3 className="font-bold text-lg mb-2">{site.slug}</h3>
              <div className="flex gap-2">
                <Link 
                  href={`/visualizar/${site.slug}`} 
                  className="text-xs bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
                >
                  Ver Site
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-500">Você ainda não tem sites criados.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
          }
