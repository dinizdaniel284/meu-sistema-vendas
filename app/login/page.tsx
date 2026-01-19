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
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // CONFIGURAÇÃO NEON EXTREMA: 250 Neurônios e Brilho Máximo
  const particlesOptions: any = useMemo(() => ({
    background: { color: { value: "#02040a" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 250, links: { opacity: 0.8 } },
        push: { quantity: 10 },
      },
    },
    particles: {
      color: { value: ["#10b981", "#34d399", "#059669"] }, // Variações de verde neon
      links: {
        color: "#10b981",
        distance: 110, // Teia muito mais fechada
        enable: true,
        opacity: 0.5,
        width: 1.5,
        shadow: {
          enable: true,
          blur: 5,
          color: "#10b981"
        }
      },
      move: {
        enable: true,
        speed: 2.2,
        direction: "none" as const,
        outModes: { default: "out" },
      },
      number: { 
        density: { enable: true, area: 500 }, // Área menor = muito mais densidade
        value: 250 // O ápice da rede neural
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: { enable: true, speed: 2, sync: false }
      },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#02040a]">
      {/* LUZ NEON DE FUNDO: Efeito Aurora Boreal Esmeralda */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full" />

      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="relative z-10 w-full max-w-[430px] p-6">
        <div className="bg-black/60 backdrop-blur-3xl p-10 rounded-[3rem] border-2 border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.6)] animate-pulse">
              <span className="text-black text-4xl font-black">D</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.1em] uppercase">
              NET<span className="text-emerald-500 italic">WORK</span> IA
            </h1>
            <div className="h-1 w-20 bg-emerald-500 mt-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
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
                    inputBackground: 'rgba(255,255,255,0.02)',
                    inputBorder: 'rgba(16,185,129,0.2)',
                    inputText: 'white',
                  },
                  radii: { borderRadiusButton: '16px', inputBorderRadius: '16px' }
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${origin}/dashboard`}
          />
        </div>
        <p className="text-center text-emerald-500/40 text-[9px] mt-8 uppercase tracking-[0.5em] font-bold animate-pulse">
          Sincronizando com a Matrix...
        </p>
      </div>
    </main>
  );
}