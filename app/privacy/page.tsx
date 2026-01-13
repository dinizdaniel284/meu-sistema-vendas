export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-400 font-sans p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Política de Privacidade</h1>
        <div className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
          <section>
            <h2 className="text-white font-bold mb-2">1. Coleta de Dados</h2>
            <p>Coletamos apenas o seu endereço de e-mail com o seu consentimento explícito para fins de marketing e atualizações do sistema.</p>
          </section>
          <section>
            <h2 className="text-white font-bold mb-2">2. Armazenamento Seguro</h2>
            <p>Seus dados são armazenados utilizando a infraestrutura do **Supabase**, com criptografia de ponta e seguindo os padrões da LGPD.</p>
          </section>
          <section>
            <h2 className="text-white font-bold mb-2">3. Não Compartilhamento</h2>
            <p>A Diniz Dev Mkt nunca venderá ou compartilhará seus dados com terceiros para fins comerciais.</p>
          </section>
        </div>
        <a href="/" className="block mt-8 text-blue-500 text-sm italic">Voltar para a página inicial</a>
      </div>
    </main>
  );
}