'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoadingGerador from '@/app/components/LoadingGerador';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<any[]>([]);

  // Carrega usuário e sites
  useEffect(() => {
    const carregarUserESites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setMeusSites(data);
      setLoadingUser(false);
    };

    carregarUserESites();
  }, [router]);

  // Gerar novo site
  async function gerarSite() {
    if (gerando || !produto || !whatsapp) return;
    setGerando(true);

    try {
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto,
          whatsapp,
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        setProduto('');
        setWhatsapp('');
        // Atualiza lista de sites
        const { data } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        setMeusSites(data || []);
      } else {
        alert("Erro: " + (result.error || "Tente novamente"));
      }
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Deseja apagar este projeto?")) return;
    await supabase.from('sites').delete().eq('id', id);
    setMeusSites(prev => prev.filter(s => s.id !== id));
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-2xl text-emerald-500 animate-pulse font-black">
          Carregando Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10">
      {gerando && <LoadingGerador />}

      <header className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-black text-emerald-500">
          DINIZ<span className="text-white">DEV</span>
        </h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-lg uppercase"
        >
          Sair
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FORMULÁRIO DE GERAÇÃO */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold mb-4">Gerar Novo Site</h2>

          <div className="space-y-4">
            <input
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
              placeholder="O que você vende?"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />

            <input
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <button
              onClick={gerarSite}
              disabled={gerando}
              className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 transition-all"
            >
              {gerando ? 'Gerando...' : 'Gerar Site'}
            </button>
          </div>
        </div>

        {/* LISTA DE SITES */}
        <div className="lg:col-span-2 space-y-3">
          {meusSites.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-sm">
              Nenhum projeto ainda.
            </div>
          ) : (
            meusSites.map(site => (
              <div
                key={site.id}
                className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row gap-3 justify-between"
              >
                <div className="truncate">
                  <p className="text-sm font-bold truncate">
                    {site.conteudo?.headline || 'Sem título'}
                  </p>
                  <a
                    href={`/s/${site.slug}`}
                    target="_blank"
                    className="text-[11px] text-emerald-400"
                  >
                    Abrir site ↗
                  </a>
                </div>

                <button
                  onClick={() => deletarSite(site.id)}
                  className="px-4 py-2 text-[11px] border border-red-500/30 text-red-400 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}