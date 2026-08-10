import { supabase } from './supabase';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function apiGet<T>(caminho: string): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho} (${resposta.status})`);
  }
  return resposta.json() as Promise<T>;
}
