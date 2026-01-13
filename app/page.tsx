'use client'
import { useState } from 'react';

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
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <nav className="flex justify-between items-center py-8">
          <div className="text-2xl font-black text-white italic tracking-tighter">
            DINIZ<span className="text-blue-500 underline decoration-2 underline-offset-4">DEV</span>
          </div>
          <div className="flex gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase">AI Engine Online</span>
          </div>
        </nav>

        <section className="pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
              Sua Estratégia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Vendas IA</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg">
              Insira seus dados abaixo e deixe nossa rede neural desenhar o seu funil de conversão em segundos.
            </p>

            {!enviado ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl transition-all focus-within:border-blue-500/50">
                  <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    className="bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-slate-500"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="h-px bg-white/10 w-full" />
                  <input 
                    type="text" 
                    placeholder="O que você vende? (Ex: Mentoria, Doces, Software)" 
                    className="bg-transparent border-none outline-none px-4 py-2 text-white placeholder:text-slate-500"
                    onChange={(e) => setNicho(e.target.value)}
                  />
                </div>
                <button 
                  onClick={enviarLead}
                  disabled={carregando}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {carregando ? 'CONSULTANDO CÉREBRO IA...' : 'GERAR MINHA ESTRATÉGIA AGORA'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold flex items-center gap-3">
                  <span>✓</span> Estratégia Gerada com Sucesso!
                </div>
                
                <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform hover:scale-105">
                  <button 
                    onClick={() => alert('Função de gerar página futura aqui!')}
                    className="w-full bg-[#020617] text-white font-black py-5 rounded-[14px] flex flex-col items-center"
                  >
                    <span className="text-lg text-green-400 uppercase">Gerar Página Personalizada</span>
                    <span className="text-[10px] text-slate-400 opacity-80">Funcionalidade futura para criar mini-site</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOCKUP DA IA - AREA ONDE A RESPOSTA APARECE */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video bg-slate-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <span className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">
                  {carregando ? 'Processing Data...' : 'AI Analysis Board'}
                </span>
                <div className="text-[10px] text-slate-600 font-mono italic">
                  {nicho ? `Nicho: ${nicho.toUpperCase()}` : 'Waiting Input'}
                </div>
              </div>
              
              <div className="flex-1 p-6 font-mono overflow-y-auto">
                {carregando ? (
                  <div className="space-y-4">
                    <div className="text-blue-400 text-sm animate-pulse">Analisando mercado para: {nicho}...</div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress-line" style={{ width: '50%' }} />
                    </div>
                  </div>
                ) : estrategia ? (
                  <div className="space-y-4 animate-fade-in text-sm leading-relaxed italic text-blue-100">
                    <span className="text-[10px] text-blue-500 block not-italic font-bold mb-2">// ESTRATÉGIA IA:</span>
                    "{estrategia}"
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Aguardando dados para processamento...</p>
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
