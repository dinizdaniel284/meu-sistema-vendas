'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // Mudança para o cliente padrão
import { useRouter } from 'next/navigation';

export default function GeradorPage() {
  const [produto, setProduto] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gerando, setGerando] = useState(false);
  const [meusSites, setMeusSites] = useState<any[]>([]);
  const router = useRouter();

  // Cliente instanciado de forma persistente
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
      // Usando getUser para garantir que a sessão é válida
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id) 
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

    // Validação robusta de usuário antes de chamar a IA
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      alert("Sessão expirada. Por favor, saia e entre novamente.");
      router.push('/login');
      return;
    }

    setGerando(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          produto, 
          whatsapp, 
          userId: user.id // Passando o ID validado
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('last_generated_site', JSON.stringify(data));
        await carregarSites();
        router.push('/dashboard/visualizar');
      } else {
        alert(data.error || "Erro ao gerar site.");
      }
    } catch (err: any) {
      alert(err.name === 'AbortError' ? "Tempo esgotado." : "Erro de conexão.");
    } finally {
      setGerando(false);
    }
  }

  async function deletarSite(id: string) {
    if (!confirm("Apagar este site permanentemente?")) return;

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erro ao deletar. Você só pode apagar seus próprios sites.");
      } else {
        setMeusSites(prev => prev.filter(site => site.id !== id));
      }
    } catch (err) {
      console.error("Erro inesperado ao deletar:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-6 italic text-emerald-500 uppercase tracking-tighter">
          DINIZ<span className="text-white">DEV</span> IA
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Site</h2>
            <input
              className="w-full mb-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all"
              placeholder="Nome do Produto"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />
            <input
              className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none transition-all"
              placeholder="Seu WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <button
              onClick={gerarKitVendas}
              disabled={gerando}
              className={`w-full py-4 rounded-xl font-black transition-all ${
                gerando ? 'bg-gray-600 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95'
              }`}
            >
              {gerando ? '🧠 PROCESSANDO...' : 'GERAR SITE'}
            </button>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-slate-300 uppercase tracking-widest text-sm">Meus Projetos Privados</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {meusSites.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-white/5 rounded-3xl p-10 text-center">
                   <p className="text-slate-400 text-sm">Nenhum site encontrado na sua conta.</p>
                </div>
              ) : (
                meusSites.map((site) => (
                  <div key={site.id} className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
                    <div className="h-32 bg-slate-800 relative">
                      {site.conteudo?.imagem ? (
                        <img src={site.conteudo.imagem} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Site" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-slate-500 italic">Sem Preview</div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-sm truncate uppercase tracking-tight">
                        {site.conteudo?.headline || 'Produto Gerado'}
                      </h3>
                      <p className="text-[10px] text-emerald-400 mb-3 truncate font-mono">
                        /s/{decodeURIComponent(site.slug)}
                      </p>

                      <div className="flex gap-2">
                        <a href={`/s/${site.slug}`} target="_blank" className="flex-1 text-center text-[10px] bg-white/5 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-all">
                          Abrir
                        </a>
                        <button onClick={() => copiarLink(site.slug)} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg">
                          Link
                        </button>
                        <button onClick={() => deletarSite(site.id)} className="text-[10px] bg-red-500/10 text-red-500 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                          Deletar
                        </button>
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
