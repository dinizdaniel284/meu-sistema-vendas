'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoadingGerador from '@/app/components/LoadingGerador';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PreviewData = {
  headline: string;
  subheadline: string;
  guia_completo: string;
  beneficios: string[];
  imagem: string;
  whatsapp?: string;
};

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const router = useRouter();

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

  // Preview estável (sem pular layout)
  useEffect(() => {
    setPreview({
      headline: produto || 'Produto Incrível',
      subheadline: 'Uma solução moderna para o seu problema',
      guia_completo:
        'Este é um material demonstrativo para mostrar como seu site ficará.\n\n' +
        'Quando você gerar de verdade, a IA vai escrever um texto persuasivo completo.\n\n' +
        'Aqui você já consegue visualizar a estrutura final da página.',
      beneficios: ['Rápido', 'Simples', 'Funciona no celular', 'Pronto para vender'],
      imagem: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
      whatsapp,
    });
  }, [produto, whatsapp]);

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
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        router.push(`/s/${result.slug}`);
      } else {
        alert("Erro: " + (result.error || "Tente novamente"));
      }
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 flex flex-col gap-10 overflow-x-hidden">
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
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 min-h-[520px]">
          <h2 className="text-sm font-bold mb-4">Pré-visualização</h2>

          {preview ? (
            <div className="space-y-4">
              <div className="w-full aspect-video bg-black/40 rounded-xl overflow-hidden">
                <img
                  src={preview.imagem}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              </div>

              <h3 className="font-black text-lg md:text-2xl">
                {preview.headline}
              </h3>

              <p className="text-slate-400 text-sm md:text-base">
                {preview.subheadline}
              </p>

              <div className="space-y-2 text-slate-300 text-sm">
                {preview.guia_completo.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <ul className="list-disc list-inside text-slate-300 text-sm">
                {preview.beneficios.map((b, i) => (
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
            <p className="text-slate-500 text-sm">
              Preencha os campos para ver a pré-visualização.
            </p>
          )}
        </div>
      </div>

      {/* Lista de sites */}
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
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
