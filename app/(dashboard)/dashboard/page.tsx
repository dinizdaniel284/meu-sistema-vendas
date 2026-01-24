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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-500 animate-bounce font-black text-2xl">
          DINIZDEV
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="border-b border-white/10 bg-black/20 px-8 py-4 flex justify-between">
        <div className="text-xl font-black">
          DINIZ<span className="text-blue-500">DEV</span>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold"
        >
          Sair
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          Bem-vindo, {user?.email?.split('@')[0]} 🚀
        </h1>

        <button
          onClick={() => router.push('/dashboard/gerador')}
          className="bg-blue-600 px-6 py-4 rounded-xl font-black"
        >
          Criar Mini-Site IA
        </button>
      </main>
    </div>
  );
}