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
  const [preview, setPreview] = useState<any>(null);
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
  }

  useEffect(() => { carregarSites(); }, []);

  // Atualiza preview conforme inputs
  useEffect(() => {
    setPreview({
      headline: produto || 'Produto Incrível',
      subheadline: 'Qualidade garantida',
      whatsapp: whatsapp,
      beneficios: ['Benefício 1', 'Benefício 2', 'Benefício 3'],
      imagem: 'https://via.placeholder.com/800x400.png?text=Seu+Produto'
    });
  }, [produto, whatsapp]);

  // Função gerar site
  async function gerarKitVendas() {
    if (gerando || !produto || !whatsapp) return;

    setGerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Usuário não encontrado.");

      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp, userId: user.id }),
      });

      const result = await response.json();

      if (response.ok) {
        // Salva o último site gerado para preview local
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        // Redireciona para o site final
        router.push(`/s/${result.slug}`);
      } else {
        alert("Erro: " + (result.error || "Tente novamente"));
      }
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 flex flex-col gap-10">
      {gerando && <LoadingGerador />}

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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-bold mb-2">Novo Projeto</h2>

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
            className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 transition-all"
          >
            {gerando ? 'Gerando...' : 'Gerar Site'}
          </button>
        </div>

        {/* PREVIEW */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold mb-4">Pré-visualização</h2>
          {preview ? (
            <div className="space-y-4">
              <div className="h-40 md:h-52 bg-black/40 rounded-xl overflow-hidden">
                <img src={preview.imagem} className="w-full h-full object-cover" alt="Preview" />
              </div>
              <h3 className="font-black text-lg md:text-2xl">{preview.headline}</h3>
              <p className="text-slate-400 text-sm md:text-base">{preview.subheadline}</p>
              <ul className="list-disc list-inside text-slate-300 text-sm">
                {preview.beneficios.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {preview.whatsapp && (
                <a
                  href={`https://wa.me/${preview.whatsapp.replace(/\D/g, '')}?text=Olá! Quero saber mais sobre ${encodeURIComponent(preview.headline)}`}
                  target="_blank"
                  className="block text-center bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-xl font-bold text-sm mt-2"
                >
                  Testar Link WhatsApp
                </a>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Preencha os campos para ver a pré-visualização.</p>
          )}
        </div>
      </div>

      {/* Lista de sites do usuário */}
      <section className="mt-10">
        <h2 className="text-sm font-bold mb-4">Meus Projetos</h2>
        <div className="space-y-3">
          {meusSites.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum projeto ainda.</p>
          ) : (
            meusSites.map(site => (
              <div
                key={site.id}
                className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row gap-3 justify-between"
              >
                <div className="truncate">
                  <p className="text-sm font-bold truncate">{site.conteudo?.headline || 'Sem título'}</p>
                  <a href={`/s/${site.slug}`} target="_blank" className="text-[11px] text-emerald-400">
                    Abrir site ↗
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}