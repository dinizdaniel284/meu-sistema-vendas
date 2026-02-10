'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meusSites, setMeusSites] = useState<any[]>([]);

  useEffect(() => {
    const checkUserAndFetchSites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      setUser(session.user);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setMeusSites(data);
      setLoading(false);
    };

    checkUserAndFetchSites();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="backdrop-blur-md bg-black/20 border-b border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="text-lg sm:text-2xl font-black tracking-tighter">
          DINIZ<span className="text-emerald-500">DEV</span>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="px-3 sm:px-4 py-2 border border-red-500/20 text-red-500/70 rounded-xl text-[9px] sm:text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
        >
          Sair
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-12">
        <h1 className="text-3xl sm:text-5xl font-black mb-6">Bem-vindo, <span className="text-emerald-500">{user.email.split('@')[0]}</span></h1>
        {/* Lista de sites */}
        {meusSites.length === 0 ? (
          <p className="text-slate-500">Nenhum projeto criado ainda.</p>
        ) : (
          meusSites.map(site => (
            <div key={site.id}>{site.conteudo?.headline || site.slug}</div>
          ))
        )}
      </main>
    </div>
  );
}