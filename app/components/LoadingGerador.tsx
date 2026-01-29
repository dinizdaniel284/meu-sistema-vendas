'use client';

export default function LoadingGerador() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Efeito de expansão no fundo */}
        <div className="absolute h-32 w-32 animate-ping rounded-full bg-emerald-500/20"></div>
        
        {/* Spinner Principal */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
        
        {/* Logo Central */}
        <div className="absolute font-black text-emerald-500 text-xl italic animate-pulse">
          D<span className="text-white">D</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">
          Construindo sua Máquina de Vendas
        </h2>
        <p className="mt-2 text-slate-400 text-sm animate-pulse">
          A IA Llama 3.3 70B está redigindo sua cópia e selecionando imagens...
        </p>
      </div>
    </div>
  );
}