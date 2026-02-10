'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoadingGerador from '@/app/components/LoadingGerador';

// 🔒 Proteção contra env inexistente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase env vars não encontradas. Cliente não será inicializado.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

type Site = {
  id: string;
  slug: string;
  conteudo?: {
    headline?: string;
  };
};

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<Site[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const router = useRouter();

  async function carregarSites() {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar sites:', error);
      return;
    }

    setMeusSites((data || []) as Site[]);
  }

  useEffect(() => {
    carregarSites();
  }, []);

  async function gerarKitVendas() {
    if (gerando) return;

    if (!produto.trim() || !whatsapp.trim()) {
      alert('Preencha o produto e o WhatsApp.');
      return;
    }

    if (!supabase) {
      alert('Supabase não configurado corretamente.');
      return;
    }

    setGerando(true);
    setErro(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Você precisa estar logado.');
        return;
      }

      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: produto.trim(),
          whatsapp: whatsapp.trim(),
          userId: user.id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Erro ao gerar site');
      }

      localStorage.setItem('last_generated_site', JSON.stringify(result));
      setProduto('');
      setWhatsapp('');
      await carregarSites();
      router.push('/visualizar');

    } catch (err: any) {
      console.error(err);
      setErro(err.message || 'Erro inesperado');
      alert('Erro ao gerar o site: ' + (err.message || 'Tente novamente'));
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!supabase) return;

    const ok = confirm('Deseja apagar este projeto?');
    if (!ok) return;

    const { error } = await supabase.from('sites').delete().eq('id', id);

    if (error) {
      alert('Erro ao deletar projeto');
      console.error(error);
      return;
    }

    setMeusSites(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-black text-emerald-500">
            DINIZ<span className="text-white">DEV</span>
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-lg uppercase"
          >
            Painel
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold mb-4">Novo Projeto</h2>

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
                onClick={gerarKitVendas}
                disabled={gerando}
                className="w-full py-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {gerando ? 'Gerando...' : 'Gerar Site'}
              </button>

              {erro && (
                <p className="text-red-400 text-xs">{erro}</p>
              )}
            </div>
          </div>

          {/* LISTA */}
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
    </div>
  );
}