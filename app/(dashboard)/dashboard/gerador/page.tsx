'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const copiarLink = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado! 🚀");
  };

  async function carregarSites() {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao carregar sites:", error);
        return;
      }
      setMeusSites(data || []);
    } catch (err) {
      console.error("Erro inesperado ao carregar sites:", err);
    }
  }

  useEffect(() => {
    carregarSites();
  }, []);

  async function gerarKitVendas() {
    if (!produto || !whatsapp) {
      alert("Preencha o produto e o WhatsApp!");
      return;
    }

    setGerando(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setResultado(data);
        localStorage.setItem('last_generated_site', JSON.stringify(data));
        carregarSites();
        router.push('/dashboard/visualizar');
      } else {
        console.error("Erro na API:", data);
        alert(data.error || "Erro ao gerar site.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        alert("Tempo esgotado. A IA demorou demais para responder.");
      } else {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão com o servidor.");
      }
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Apagar este site?")) return;

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao deletar site:", error);
        alert("Não foi possível apagar o site.");
      } else {
        carregarSites();
      }
    } catch (err) {
      console.error("Erro inesperado ao deletar:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-6">Gerador IA</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">Criar Novo Site</h2>

            <input
              className="w-full mb-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3"
              placeholder="Produto"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />

            <input
              className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3"
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <button
              onClick={gerarKitVendas}
              disabled={gerando}
              className={`w-full py-4 rounded-xl font-black transition-colors ${
                gerando ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {gerando ? 'Gerando...' : 'Gerar Site'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Meus Sites</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {meusSites.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum site gerado ainda.</p>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-slate-900 p-4 rounded-xl">
                    <h3 className="font-bold text-sm truncate">
                      {site.conteudo?.headline || 'Sem título'}
                    </h3>

                    <p className="text-[10px] text-slate-500">/s/{site.slug}</p>

                    <div className="flex gap-2 mt-2">
                      <a
                        href={`/s/${site.slug}`}
                        target="_blank"
                        className="text-xs bg-blue-500/10 px-3 py-1 rounded"
                      >
                        Abrir
                      </a>

                      <button
                        onClick={() => copiarLink(site.slug)}
                        className="text-xs bg-emerald-500/10 px-3 py-1 rounded"
                      >
                        Copiar
                      </button>

                      <button
                        onClick={() => deletarSite(site.id)}
                        className="text-xs bg-red-500/10 px-3 py-1 rounded"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
