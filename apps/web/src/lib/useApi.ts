import { useEffect, useState } from 'react';
import { apiGet } from './api';

interface EstadoRequisicao<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useApi<T>(caminho: string): EstadoRequisicao<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    apiGet<T>(caminho)
      .then((resultado) => {
        if (ativo) setDados(resultado);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [caminho, versao]);

  return { dados, carregando, erro, recarregar: () => setVersao((v) => v + 1) };
}
