'use client';

export default function LoadingGerador() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md px-4 text-center"
      role="status"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center">
        {/* Efeito de pulso no fundo */}
        <div className="absolute h-28 w-28 sm:h-32 sm:w-32 animate-ping rounded-full bg-emerald-500/20" />

        {/* Spinner principal */}
        <div className="h-16 w-16 sm:h-20 sm:w-20 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />

        {/* Logo central */}
        <div className="absolute font-black text-emerald-500 text-lg sm:text-xl italic animate-pulse select-none">
          D<span className="text-white">D</span>
        </div>
      </div>

      <div className="mt-8 max-w-sm">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white uppercase tracking-widest">
          Construindo sua Máquina de Vendas
        </h2>
        <p className="mt-3 text-slate-400 text-xs sm:text-sm animate-pulse leading-relaxed">
          A IA Llama 3.3 70B está redigindo sua cópia e selecionando imagens...
        </p>
      </div>
    </div>
  );
}