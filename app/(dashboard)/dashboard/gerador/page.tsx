'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoadingGerador from '@/app/components/LoadingGerador'; 

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  const router = useRouter();

  const supabase = createClient(
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id) 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeusSites(data || []);
    } catch (err) {
      console.error("Erro ao carregar sites:", err);
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sessão expirada.");
      router.push('/login');
      return;
    }

    setGerando(true);

    try {
      const whatsappLimpo = whatsapp.replace(/\D/g, '');

      // ✅ REMOVEMOS O ABORTCONTROLLER PARA EVITAR O ERRO DO NEXT 16/TURBOPACK
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          produto, 
          whatsapp: whatsappLimpo, 
          userId: user.id 
        }),
      });

      const text = await response.text();
      if (!text) throw new Error("Resposta vazia.");
      
      const data = JSON.parse(text);

      if (response.ok) {
        localStorage.setItem('last_generated_site', JSON.stringify(data));
        await carregarSites();
        router.push('/dashboard/visualizar');
      } else {
        alert(data.error || "Erro ao gerar site.");
      }
    } catch (err: any) {
      console.error("Erro na geração:", err);
      alert("A IA está processando muitos pedidos. Tente clicar novamente em 5 segundos.");
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Apagar este site?")) return;
    try {
      await supabase.from('sites').delete().eq('id', id);
      setMeusSites(prev => prev.filter(site => site.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      {gerando && <LoadingGerador />}

      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic text-emerald-500 uppercase tracking-tighter">
            DINIZ<span className="text-white">DEV</span> IA
          </h1>
          <div className="text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/10 text-slate-400 font-mono">
            ENGINE: <span className="text-emerald-400">LLAMA-3.3-70B</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 text-white">Novo Projeto</h2>
            <div className="space-y-4">
              <input
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-white"
                placeholder="Ex: Hamburgueria Artesanal..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              />
              <input
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all text-white"
                placeholder="WhatsApp (ex: 11999999999)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <button
                onClick={gerarKitVendas}
                disabled={gerando}
                className={`w-full py-4 rounded-xl font-black transition-all ${
                  gerando ? 'bg-gray-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
                }`}
              >
                {gerando ? '🧠 GERANDO ESTRATÉGIA...' : 'CRIAR LANDING PAGE'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-slate-300 uppercase tracking-widest text-sm">Meus Projetos</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {meusSites.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-white/5 rounded-3xl p-10 text-center">
                    <p className="text-slate-400 text-sm italic">Sua galeria está vazia.</p>
                </div>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="h-32 bg-slate-800 relative">
                      {site.conteudo?.imagem && (
                        <img src={site.conteudo.imagem} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Preview" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm truncate uppercase text-white">
                        {site.conteudo?.headline || 'Landing Page'}
                      </h3>
                      <div className="flex gap-2 mt-4">
                        <a href={`/s/${site.slug}`} target="_blank" className="flex-1 text-center text-[10px] bg-white/5 border border-white/10 py-2 rounded-lg hover:bg-white/10">Ver Site</a>
                        <button onClick={() => copiarLink(site.slug)} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg">Link</button>
                        <button onClick={() => deletarSite(site.id)} className="text-[10px] bg-red-500/10 text-red-500 px-3 py-2 rounded-lg">Excluir</button>
                      </div>
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