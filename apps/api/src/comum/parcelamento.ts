export function dividirValorEmParcelas(valorTotal: number, parcelas: number): number[] {
  const base = Math.floor((valorTotal / parcelas) * 100) / 100;
  const valores = Array(parcelas).fill(base);
  const diferenca = Math.round((valorTotal - base * parcelas) * 100) / 100;
  valores[valores.length - 1] = Math.round((valores[valores.length - 1] + diferenca) * 100) / 100;
  return valores;
}

export function adicionarMeses(data: Date, meses: number): Date {
  const resultado = new Date(data);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}
