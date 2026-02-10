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
  const [particlesReady, setParticlesReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      setOrigin(window.location.origin);
    }

    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesReady(true);
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
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: !isMobile, mode: "grab" },
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
        speed: isMobile ? 1.2 : 2,
        direction: "none",
        outModes: "out", // ✅ CORRIGIDO AQUI
      },
      number: { 
        density: { enable: true, area: 800 }, 
        value: isMobile ? 50 : 120
      },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), [isMobile]);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#02040a] p-4">
      {/* Glow suave no fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_50%)] pointer-events-none" />

      {particlesReady && (
        <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 z-0" />
      )}

      <div className="relative z-10 w-full max-w-[360px] animate-in fade-in zoom-in duration-500">
        <div className="bg-black/60 backdrop-blur-3xl p-6 sm:p-7 md:p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-transform hover:scale-110">
              <span className="text-black text-3xl font-black italic">D</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-[0.15em] uppercase text-center">
              NET<span className="text-emerald-500">WORK</span>
            </h1>

            <p className="text-emerald-500/60 text-[9px] mt-2 font-bold tracking-[0.4em] uppercase">
              Sistema Privado
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
                    inputBorder: 'rgba(16,185,129,0.15)',
                    inputText: 'white',
                    inputPlaceholder: '#4b5563',
                  },
                  radii: { 
                    borderRadiusButton: '16px', 
                    inputBorderRadius: '16px' 
                  },
                  fonts: { 
                    bodyFontFamily: 'inherit', 
                    buttonFontFamily: 'inherit' 
                  }
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={origin ? `${origin}/dashboard` : undefined}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu e-mail',
                  password_label: 'Sua senha',
                  button_label: 'ACESSAR SISTEMA',
                  loading_button_label: 'AUTENTICANDO...',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Crie uma senha forte',
                  button_label: 'CRIAR MINHA CONTA',
                  loading_button_label: 'REGISTRANDO...',
                  link_text: 'Não tem conta? Cadastre-se',
                }
              }
            }}
          />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-emerald-500/30 text-[8px] uppercase tracking-[0.4em] font-bold">
            © 2026 DINIZ DEV // DATA ISOLATION ACTIVE
          </p>
        </div>
      </div>
    </main>
  );
}