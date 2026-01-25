'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Cliente do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [origin, setOrigin] = useState('');
  const [init, setInit] = useState(false);
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
      setInit(true);
    });

    // ESCUTA O LOGIN: Quando logar, o usuário é levado para a dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // O Supabase já guarda o ID do usuário na sessão aqui
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
        direction: "none" as const,
        outModes: { default: "out" },
      },
      number: { 
        density: { enable: true, area: 800 }, 
        value: isMobile ? 60 : 200 
      },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), [isMobile]);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#02040a] p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />

      {init && (
        <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0 z-0" />
      )}

      <div className="relative z-10 w-full max-w-[360px] animate-fade-in">
        <div className="bg-black/60 backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] border border-emerald-500/20 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <span className="text-black text-2xl font-black italic">D</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase text-center">
              NET<span className="text-emerald-500">WORK</span>
            </h1>
            <p className="text-emerald-500/60 text-[10px] mt-2 font-bold tracking-widest">SISTEMA PRIVADO</p>
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
            providers={[]} // Apenas e-mail e senha por enquanto
            redirectTo={`${origin}/dashboard`}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Acessar Sistema',
                  loading_button_label: 'Autenticando...',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Crie uma senha',
                  button_label: 'Criar Minha Conta',
                  loading_button_label: 'Registrando...',
                  link_text: 'Não tem conta? Cadastre-se',
                }
              }
            }}
          />
        </div>
        
        <p className="text-center text-emerald-500/30 text-[8px] mt-6 uppercase tracking-[0.4em] font-bold">
          © 2026 DINIZ DEV // DATA ISOLATION ACTIVE
        </p>
      </div>
    </main>
  );
}
