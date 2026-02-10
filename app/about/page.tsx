export default function About() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full bg-white/5 border border-white/10 p-6 sm:p-8 md:p-12 rounded-3xl backdrop-blur-xl">
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6 italic">
          SOBRE <span className="text-blue-500">DINIZ.DEV</span>
        </h1>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          A <span className="font-bold text-white">Diniz Dev Mkt</span> nasceu da necessidade de unir o poder da engenharia de software com a precisão do marketing digital de alta performance.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-8">
          Em 2026, não basta apenas saber codar; é preciso saber vender o que se cria. Nossa missão é capacitar desenvolvedores para dominarem a stack moderna (Next.js, Supabase, IA) e criarem seus próprios fluxos de receita automáticos.
        </p>

        <a
          href="/"
          className="inline-flex items-center text-blue-400 font-bold hover:text-blue-300 transition-colors text-sm sm:text-base"
        >
          ← Voltar para a jornada
        </a>
      </div>
    </main>
  );
}