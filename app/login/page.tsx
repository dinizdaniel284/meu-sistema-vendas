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
  const [isMobile, setIsMobile] = useState(false); // Detectar celular
  const router = useRouter();

  useEffect(() => {
    // Detecta se é celular para otimizar
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      setOrigin(window.location.origin);
    }

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const particlesOptions: any = useMemo(() => ({
    background: { color: { value: "#02040a" } },
    fpsLimit: 60, // Limitamos a 60fps para não fritar o celular
    interactivity: {
      events: {
        onHover: { enable: !isMobile, mode: "grab" }, // Desativa hover no mobile (não tem mouse)
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 200, links: { opacity: 0.5 } },
        push: { quantity: 4 },
      },
    },
    particles: {
      color: { value: "#10b981" },
      links: {
        color: "#10b981",
        distance: 110,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: isMobile ? 1.2 : 2, // Mais devagar no mobile para fluidez
        direction: "none" as const,
        outModes: { default: "out" },
      },
      number: { 
        density: { enable: true, area: 800 }, 
        value: isMobile ? 60 : 200 // Reduz para 60 no celular, mantém 200 no PC
      },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), [isMobile]);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#02040a] p-4">
      {/* Luzes Neon de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />

      {init && (
        <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 z-0" />
      )}

      {/* Card de Login Menor e mais Luxuoso */}
      <div className="relative z-10 w-full max-w-[360px] animate-fade-in">
        <div className="bg-black/60 backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] border border-emerald-500/20 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <span className="text-black text-2xl font-black italic">D</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase text-center">
              NET<span className="text-emerald-500">WORK</span>
            </h1>
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
                  radii: { borderRadiusButton: '12px', inputBorderRadius: '12px' }
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${origin}/dashboard`}
          />
        </div>
        
        <p className="text-center text-emerald-500/30 text-[8px] mt-6 uppercase tracking-[0.4em] font-bold">
          © 2026 DINIZ DEV // SISTEMA OTIMIZADO
        </p>
      </div>
    </main>
  );
}