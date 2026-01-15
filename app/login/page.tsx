'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Importamos o roteador

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [origin, setOrigin] = useState('');
  const router = useRouter(); // Inicializamos o roteador

  useEffect(() => {
    setOrigin(window.location.origin);

    // ESCUTADOR DE SESSÃO: Isso aqui é a mágica!
    // Ele percebe na hora quando o usuário loga e redireciona.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Sistema de Vendas IA
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Acesse sua área exclusiva para gerar lucros.
        </p>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#10b981', 
                  brandButtonText: 'white',
                },
              },
            },
          }}
          theme="dark"
          showLinks={true}
          providers={[]} 
          redirectTo={`${origin}/dashboard`} // Mudamos aqui também para garantir
        />
      </div>
    </div>
  );
        }
