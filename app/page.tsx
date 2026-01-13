'use client'
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviarLead() {
    if (!email || !email.includes('@')) return alert("E-mail inválido!");
    setCarregando(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) setEnviado(true);
    } catch (err) {
      alert("Erro ao conectar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <nav className="flex justify-between items-center py-8">
          <div className="text-2xl font-black text-white italic">DINIZ<span className="text-blue-500">DEV</span></div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white">Recursos</a>
            <a href="#faq" className="hover:text-white">Dúvidas</a>
          </div>
        </nav>

        {/* Hero + Mockup Section */}
        <section className="pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Sistemas que <span className="text-blue-500">Vendem</span> enquanto você dorme.
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg">
              Domine a stack Next.js + Supabase e integre IA para criar funis de vendas automáticos e lucrativos.
            </p>

            {!enviado ? (
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="bg-transparent border-none outline-none px-4 py-3 flex-1 text-white placeholder:text-slate-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  onClick={enviarLead}
                  disabled={carregando}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all active:scale-95"
                >
                  {carregando ? 'Entrando...' : 'Garantir Acesso'}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold">
                ✓ Acesso liberado! Cheque seu e-mail.
              </div>
            )}
          </div>

          {/* MOCKUP PLACEHOLDER */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative aspect-video bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="text-slate-600 font-mono text-sm">[ Dashboard Mockup da IA ]</div>
              {/* Aqui você pode colocar uma imagem no futuro */}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 border-t border-white/5">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: "Preciso saber programar?", a: "Começamos do absoluto zero, focando no que traz resultado rápido." },
              { q: "Como a IA é usada?", a: "Usamos a IA para criar cópias de vendas e analisar dados dos leads automaticamente." },
              { q: "O acesso é vitalício?", a: "Sim! Você terá acesso a todas as atualizações da turma de 2026." },
              { q: "Tem suporte?", a: "Suporte direto via Discord com nossa comunidade de desenvolvedores." }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h3 className="font-bold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer com Políticas */}
        <footer className="py-16 border-t border-white/5 text-center">
          <div className="flex justify-center gap-8 mb-6 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <a href="/about" className="hover:text-blue-400 transition-colors">Sobre</a>
            <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="/cookies" className="hover:text-blue-400 transition-colors">Cookies</a>
          </div>
          <p className="text-slate-600 text-xs">© 2026 DINIZ DEV MKT. Focado em resultados reais.</p>
        </footer>
      </div>
    </main>
  );
}