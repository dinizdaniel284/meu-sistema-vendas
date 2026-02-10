'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [nicho, setNicho] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [estrategia, setEstrategia] = useState('');

  async function enviarLead() {
    if (!email || !email.includes('@')) return alert("E-mail inválido!");
    if (!nicho) return alert("Diga-me o que você vende para eu te ajudar!");

    setCarregando(true);
    setEstrategia('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nicho }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnviado(true);
        setEstrategia(data.ia_result);
        localStorage.setItem('ultimo_nicho', nicho);
      } else {
        alert(data.ia_result || "Erro na resposta da IA.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden">
      {/* Efeito de fundo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* NAVBAR */}
        <nav className="flex justify-between items-center py-6 sm:py-8">
          <div className="text-lg sm:text-2xl font-black text-white italic tracking-tighter">
            DINIZ<span className="text-blue-500 underline decoration-2 underline-offset-4">DEV IA</span>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center">
            <div className="hidden md:flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AI Engine Online
              </span>
            </div>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            >
              Área VIP
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="pt-8 pb-14 sm:pt-12 sm:pb-24 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* COLUNA ESQUERDA */}
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 sm:mb-6 tracking-tighter">
              Sua Estratégia de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">
                Vendas IA
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-10 max-w-lg leading-relaxed">
              Insira seus dados e deixe nossa rede neural desenhar o seu funil de conversão em segundos.
            </p>

            {!enviado ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-2xl transition-all focus-within:border-blue-500/50">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    className="bg-transparent border-none outline-none px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder:text-slate-500"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="h-px bg-white/10 w-full" />
                  <input
                    type="text"
                    placeholder="O que você vende? (Ex: Doces, Mentorias)"
                    className="bg-transparent border-none outline-none px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder:text-slate-500"
                    onChange={(e) => setNicho(e.target.value)}
                  />
                </div>

                <button
                  onClick={enviarLead}
                  disabled={carregando}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 sm:py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase text-[10px] sm:text-xs tracking-widest"
                >
                  {carregando ? 'CONSULTANDO CÉREBRO IA...' : 'GERAR MINHA ESTRATÉGIA AGORA'}
                </button>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6 animate-fade-in">
                <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold flex items-center gap-3 text-sm">
                  <span className="text-lg">✓</span> Estratégia Inicial Liberada!
                </div>

                <div className="group p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02]">
                  <Link
                    href="/login"
                    className="w-full bg-[#020617] text-white font-black py-4 sm:py-6 rounded-[12px] sm:rounded-[14px] flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-base sm:text-xl text-white uppercase tracking-tighter flex items-center gap-2 text-center">
                      🔒 DESBLOQUEAR FUNIL COMPLETO
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-blue-400 opacity-80 uppercase font-bold">
                      CRIAR IMAGEM E PÁGINA DE VENDA AGORA
                    </span>
                  </Link>
                </div>

                <button
                  onClick={() => setEnviado(false)}
                  className="text-[10px] sm:text-xs text-slate-500 underline underline-offset-4 hover:text-white transition-colors"
                >
                  Testar outro nicho
                </button>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA - PAINEL IA */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 transition duration-1000"></div>

            <div className="relative aspect-video bg-slate-950 border border-white/10 rounded-xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="text-[9px] sm:text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase animate-pulse">
                  {carregando ? 'Processing Data...' : 'AI Analysis Board'}
                </span>
                <div className="text-[9px] sm:text-[10px] text-slate-600 font-mono italic truncate max-w-[50%] text-right">
                  {nicho ? `Nicho: ${nicho.toUpperCase()}` : 'Waiting Input'}
                </div>
              </div>

              <div className="flex-1 p-3 sm:p-6 font-mono overflow-y-auto">
                {carregando ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-blue-400 text-xs sm:text-sm animate-pulse">
                      Mapeando oportunidades para {nicho}...
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress-line" style={{ width: '65%' }} />
                    </div>
                  </div>
                ) : estrategia ? (
                  <div className="space-y-3 sm:space-y-4 animate-fade-in text-xs sm:text-sm leading-relaxed italic text-blue-100">
                    <span className="text-[9px] sm:text-[10px] text-blue-500 block not-italic font-bold mb-2">
                      // PRÉVIA DA ESTRATÉGIA:
                    </span>
                    "{estrategia}"
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg not-italic">
                      <p className="text-[9px] sm:text-[10px] text-blue-400 uppercase font-bold tracking-tighter">
                        [!] Desbloqueie o acesso VIP para gerar a página completa.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-4 border-2 border-dashed border-slate-700 rounded-full animate-spin-slow" />
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.3em]">
                      Aguardando dados...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}