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

  // CONFIGURAÇÃO TURBINADA: Mais neurônios e conexões densas
  const particlesOptions: any = useMemo(() => ({
    background: { color: { value: "#020617" } }, // Fundo azul marinho quase preto (mais luxuoso)
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 220, links: { opacity: 0.6 } },
        push: { quantity: 6 },
      },
    },
    particles: {
      color: { value: "#10b981" },
      links: {
        color: "#10b981",
        distance: 130, // Menor distância para criar uma teia mais fechada
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.8,
        direction: "none" as const,
        outModes: { default: "out" },
      },
      number: { 
        density: { enable: true, area: 600 }, 
        value: 180 // Quase dobramos a quantidade de neurônios
      },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: { enable: true, speed: 1, sync: false }
      },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), []);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* GLOW DE FUNDO: Efeito de profundidade luxuoso */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_65%)]" />

      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="relative z-10 w-full max-w-[420px] p-6">
        {/* CARD GLASSMORPHISM REFORÇADO */}
        <div className="bg-zinc-950/50 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(16,185,129,0.05)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-transform hover:scale-110 duration-500">
              <span className="text-black text-3xl font-black italic">D</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
              SISTEMA <span className="text-emerald-500">INTELIGENTE</span>
            </h1>
            <p className="text-emerald-500/50 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
              Neural Network Access
            </p>
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
                    inputBackground: 'rgba(255,255,255,0.03)',
                    inputBorder: 'rgba(255,255,255,0.08)',
                    inputText: 'white',
                    inputPlaceholder: '#4b5563'
                  },
                  radii: {
                    borderRadiusButton: '14px',
                    inputBorderRadius: '14px',
                  }
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${origin}/dashboard`}
          />
        </div>
        
        <div className="flex flex-col items-center mt-8 gap-1">
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-bold">
            Protocolo de Segurança Ativo
          </p>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <p className="text-zinc-800 text-[8px] mt-2 font-mono">
            v2.0.48-STABLE // DINIZ DEV
          </p>
        </div>
      </div>
    </main>
  );
}