'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [origin, setOrigin] = useState('');
  const [init, setInit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Inicializa o motor de partículas
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    setOrigin(window.location.origin);

    // Escutador para redirecionar automático ao logar
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Configuração da Rede Neural (Visual)
  const particlesOptions = useMemo(() => ({
    background: { color: { value: "#050505" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 200, links: { opacity: 0.8 } },
      },
    },
    particles: {
      color: { value: "#10b981" },
      links: {
        color: "#10b981",
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      move: { enable: true, speed: 1.5 },
      number: { density: { enable: true, area: 800 }, value: 100 },
      opacity: { value: 0.5 },
      size: { value: { min: 1, max: 3 } },
    },
  }), []);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
      {init && (
        <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 z-0" />
      )}

      <div className="relative z-10 w-full max-w-[400px] p-4">
        <div className="bg-zinc-900/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <span className="text-black text-2xl font-black">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">SISTEMA <span className="text-emerald-500">IA</span></h1>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10b981',
                    brandButtonText: 'black',
                    inputBackground: 'rgba(255,255,255,0.05)',
                    inputText: 'white',
                  },
                  radii: { borderRadiusButton: '12px', inputBorderRadius: '12px' }
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${origin}/dashboard`}
          />
        </div>
      </div>
    </main>
  );
}