import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: 'admin' | 'financeiro' | 'rh';
}

interface AuthContextValor {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValor | undefined>(undefined);

function usuarioDaSessao(session: Session | null): Usuario | null {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    nome: session.user.user_metadata?.nome ?? session.user.email?.split('@')[0] ?? 'Usuário',
    papel: (session.user.app_metadata?.papel ?? 'financeiro') as Usuario['papel'],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(usuarioDaSessao(data.session));
      setCarregando(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(usuarioDaSessao(session));
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  return <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return contexto;
}
