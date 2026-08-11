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

async function requisitarComCorpo<T>(metodo: 'POST' | 'PATCH', caminho: string, corpo: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    const detalhe = await resposta.json().catch(() => null);
    throw new Error(detalhe?.message ?? `Falha ao salvar em ${caminho} (${resposta.status})`);
  }
  return resposta.json() as Promise<T>;
}

export function apiPost<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisitarComCorpo<T>('POST', caminho, corpo);
}

export function apiPatch<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisitarComCorpo<T>('PATCH', caminho, corpo);
}
