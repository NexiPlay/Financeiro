export function Carregando() {
  return <p className="text-sm text-text-secondary">Carregando…</p>;
}

export function Erro({ mensagem }: { mensagem: string }) {
  return (
    <p className="text-sm text-red">
      Não foi possível carregar os dados ({mensagem}). Verifique se a API está rodando em <code>pnpm dev</code>.
    </p>
  );
}
