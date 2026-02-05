'use client';
import { useState } from 'react';
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
  const router = useRouter();

  async function gerarKitVendas() {
    // 1. Validação simples
    if (!produto || !whatsapp) {
      alert("Preencha o produto e o WhatsApp!");
      return;
    }

    // 2. BLOQUEIO DE SEGURANÇA (Evita os 3 sites iguais)
    if (gerando) return; 

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sessão expirada.");
      router.push('/login');
      return;
    }

    setGerando(true);

    try {
      const whatsappLimpo = whatsapp.replace(/\D/g, '');

      // Chamada para a sua API que usa o LLAMA-3.3-70B
      const response = await fetch('/api/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          produto, 
          whatsapp: whatsappLimpo, 
          userId: user.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na resposta da IA");
      }

      const data = await response.json();

      // Sucesso: Redireciona direto para o Dashboard para ver o novo projeto
      localStorage.setItem('last_generated_site', JSON.stringify(data));
      router.push('/dashboard');
      router.refresh();

    } catch (err: any) {
      console.error("Erro na geração:", err);
      alert("A IA está processando muitos pedidos. Tente clicar novamente em 5 segundos.");
    } finally {
      // Pequeno delay antes de liberar o botão novamente para garantir estabilidade
      setTimeout(() => setGerando(false), 1000);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Overlay de Loading quando estiver gerando */}
      {gerando && <LoadingGerador />}

      {/* BACKGROUND DECORATION (Efeito Neural) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER DO GERADOR */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">
            Vendas IA
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Insira seus dados e deixe nossa rede neural desenhar o seu funil de conversão em segundos.
          </p>
        </div>

        {/* FORMULÁRIO ESTILO ELITE */}
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[40px] backdrop-blur-2xl shadow-2xl">
          <div className="space-y-8">
            <div className="relative group">
              <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 ml-4 mb-2 block">Seu melhor e-mail</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                placeholder="exemplo@email.com"
                type="email"
              />
            </div>

            <div className="relative group">
              <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 ml-4 mb-2 block">O que você vende?</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                placeholder="Ex: Mentorias, Doces, Hamburgueria..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
              />
            </div>

            <div className="relative group">
              <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 ml-4 mb-2 block">WhatsApp de Conversão</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                placeholder="11999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <button
              onClick={gerarKitVendas}
              disabled={gerando}
              className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] ${
                gerando 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-95'
              }`}
            >
              {gerando ? '🧠 PROCESSANDO DADOS...' : 'GERAR MINHA ESTRATÉGIA AGORA'}
            </button>
          </div>
        </div>

        {/* AI ANALYSIS BOARD */}
        <div className="mt-8 bg-black/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-mono text-blue-400 tracking-[0.4em] uppercase">AI Analysis Board</span>
            <span className="text-[9px] font-mono text-slate-600">Waiting Input</span>
          </div>
          <div className="flex flex-col items-center py-6">
            <div className={`w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center ${gerando && 'animate-spin border-blue-500'}`}>
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <p className="mt-4 text-[9px] text-slate-600 font-bold tracking-[0.4em] uppercase">
              {gerando ? "Desenhando Funil de Alta Conversão..." : "Aguardando entrada de dados..."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
            }
      
