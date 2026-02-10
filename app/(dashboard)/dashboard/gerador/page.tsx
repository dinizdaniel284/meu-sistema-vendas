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

  async function gerarKitVendas() {
    if (gerando || !produto || !whatsapp) return;

    setGerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, whatsapp, userId: user?.id }),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('last_generated_site', JSON.stringify(result));
        setProduto('');
        setWhatsapp('');
        await carregarSites();
        router.push('/dashboard/visualizar');
      } else {
        alert("Erro: " + (result.error || "Tente novamente"));
      }
    } finally { setGerando(false); }
  }

  async function deletarSite(id: string) {
    if (!confirm("Deseja apagar este projeto?")) return;
    await supabase.from('sites').delete().eq('id', id);
    setMeusSites(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10">
      {gerando && <LoadingGerador />}
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-black text-emerald-500">DINIZ<span className="text-white">DEV</span></h1>
          <button onClick={() => router.push('/dashboard')} className="text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-lg uppercase">Painel</button>
        </header>

        {/* FORM */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold mb-4">Novo Projeto</h2>
            <input className="w-full mb-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3" placeholder="O que você vende?" value={produto} onChange={(e) => setProduto(e.target.value)} />
            <input className="w-full mb-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <button onClick={gerarKitVendas} disabled={gerando} className="w-full py-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 transition-all">{gerando ? 'Gerando...' : 'Gerar Site'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}