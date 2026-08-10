export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataISO: string): string {
  // Datas sem hora (ex: "2026-08-12") são calendário puro — evita usar
  // Date() aqui, que interpretaria como UTC e poderia voltar um dia
  // em fusos negativos (como o do Brasil).
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}
