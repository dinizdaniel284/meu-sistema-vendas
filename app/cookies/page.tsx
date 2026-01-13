export default function Cookies() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-400 font-sans p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Uso de Cookies</h1>
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <p className="mb-4">Utilizamos cookies essenciais para garantir que o site funcione corretamente e para entender como você interage com nossa plataforma.</p>
          <p>Os cookies nos ajudam a personalizar sua experiência e a otimizar nossas campanhas de marketing para que você receba apenas o que é relevante para você.</p>
        </div>
        <a href="/" className="block mt-8 text-blue-500 text-sm italic">Entendido e voltar</a>
      </div>
    </main>
  );
}