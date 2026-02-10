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
  const [lastPreview, setLastPreview] = useState<any>(null);
  const router = useRouter();

  // Carrega sites do usuário
  async function carregarSites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMeusSites(data || []);
    if (data && data.length > 0) setLastPreview(data[0]);
  }

  useEffect(() => { carregarSites(); }, []);

  // Gerar site usando IA / API
  async function gerarKitVendas() {
    if (gerando || !produto || !whatsapp) return;

    setGerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp, userId: user.id }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        setLastPreview(result.site || result);
        router.push('/visualizar');
      } else {
        alert("Erro: " + (result.error || "Tente novamente"));
      }
    } finally {
      setGerando(false);
    }
  }

  // Deletar site
  async function deletarSite(id: string) {
    if (!confirm("Deseja apagar este projeto?")) return;
    await supabase.from('sites').delete().eq('id', id);
    setMeusSites(prev => prev.filter(s => s.id !== id));
    if (lastPreview?.id === id) setLastPreview(null);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
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

        {/* FORMULÁRIO DE GERAÇÃO */}
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
              disabled={gerando || !produto || !whatsapp}
              className="w-full py-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 transition-all"
            >
              {gerando ? 'Gerando...' : 'Gerar Site'}
            </button>
          </div>
        </div>

        {/* PREVIEW DO ÚLTIMO SITE */}
        {lastPreview && (
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mt-6">
            <h3 className="font-bold text-emerald-400 mb-2">Último site gerado</h3>
            <p className="truncate mb-2">{lastPreview.conteudo?.headline || lastPreview.slug}</p>
            <a
              href={`/s/${lastPreview.slug}`}
              target="_blank"
              className="text-sm text-emerald-400 hover:underline"
            >
              Abrir site ↗
            </a>
          </div>
        )}

        {/* LISTA DE SITES */}
        <div className="space-y-3 mt-6">
          {meusSites.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-sm">
              Nenhum projeto ainda.
            </div>
          ) : meusSites.map(site => (
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
          ))}
        </div>
      </div>
    </div>
  );
}