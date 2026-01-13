'use client'
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [estrategia, setEstrategia] = useState('');

  async function enviarLead() {
    if (!email || !email.includes('@')) return alert("E-mail inválido!");
    setCarregando(true);
    setEstrategia('');
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setEnviado(true);
        setEstrategia(data.ia_result || "Estratégia processada com sucesso!");
      }
    } catch (err) {
      alert("Erro ao conectar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <nav className="flex justify-between items-center py-8">
          <div className="text-2xl font-black text-white italic tracking-tighter">
            DINIZ<span className="text-blue-500 underline decoration-2 underline-offset-4">DEV</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> SYSTEM ONLINE</span>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 uppercase tracking-widest">
              Tecnologia Next.js 14 + Gemini IA
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
              Sistemas que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Vendem</span> sozinhos.
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              Integramos inteligência artificial no seu funil para converter leads em clientes de forma automática e personalizada.
            </p>

            {!enviado ? (
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl transition-all focus-within:border-blue-500/50">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="bg-transparent border-none outline-none px-4 py-3 flex-1 text-white placeholder:text-slate-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  onClick={enviarLead}
                  disabled={carregando}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {carregando ? 'PROCESSANDO IA...' : 'GERAR ESTRATÉGIA'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold flex items-center gap-3 animate-fade-in">
                <span className="text-xl">✓</span> Acesso liberado! Analise o relatório ao lado.
              </div>
            )}
          </div>

          {/* MOCKUP DA IA - VERSÃO INSANA */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video bg-slate-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${carregando ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-[0.2em]">
                    {carregando ? 'Neural Engine Busy' : 'Neural Engine Standby'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">2026_CORE_v1.2</div>
              </div>
              
              <div className="flex-1 p-6 font-mono">
                {carregando ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-400 text-sm">
                      <span className="animate-spin text-lg">⚙️</span>
                      <span>Consultando Gemini 1.5 Flash...</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress-line" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-600 uppercase">
                      <p className="animate-pulse">Analysing Domain...</p>
                      <p className="animate-pulse delay-75">Market Fit Search...</p>
                    </div>
                  </div>
                ) : estrategia ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">AI_STRATEGY_OUTPUT</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Confidence: 94%</span>
                    </div>
                    <p className="text-blue-50 w-full text-sm sm:text-base leading-relaxed border-l-2 border-blue-600 pl-4 py-1 italic">
                      {estrategia}
                    </p>
                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div className="p-2 bg-white/[0.02] rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase">Conversion Prob.</p>
                        <p className="text-green-400 text-xs font-bold">87.4%</p>
                      </div>
                      <div className="p-2 bg-white/[0.02] rounded border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase">Lead Priority</p>
                        <p className="text-purple-400 text-xs font-bold">HIGH_GROWTH</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <div className="w-12 h-12 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center text-xl">
                      🎯
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Aguardando sinal do sistema para análise...</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[8px] text-slate-600 font-mono">
                 <span className="flex items-center gap-1"><div className="w-1 h-1 bg-blue-500 rounded-full" /> SUPABASE_DB: ACTIVE</span>
                 <span>SECURE_ENCRYPTION_AES256</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 text-center">
          <div className="flex justify-center gap-8 mb-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="/cookies" className="hover:text-blue-400 transition-colors">Política de Cookies</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
          </div>
          <p className="text-slate-700 text-[10px] uppercase font-mono tracking-widest italic">© 2026 DINIZ DEV MKT - Build the future or watch it.</p>
        </footer>
      </div>
    </main>
  );
}