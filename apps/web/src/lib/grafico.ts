export function ultimosNDias(n: number): string[] {
  const dias: string[] = [];
  const hoje = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

export function construirPolilinha(valores: number[], largura: number, altura: number, margem = 4): string {
  if (valores.length === 0) return '';
  const min = Math.min(...valores, 0);
  const max = Math.max(...valores, 0);
  const amplitude = max - min || 1;
  const passo = valores.length > 1 ? largura / (valores.length - 1) : 0;
  return valores
    .map((v, i) => {
      const x = passo * i;
      const y = altura - margem - ((v - min) / amplitude) * (altura - margem * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
