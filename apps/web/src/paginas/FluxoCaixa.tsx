import { useMemo } from 'react';
import { useApi } from '../lib/useApi';
import { formatarData, formatarMoeda } from '../lib/formatadores';
import { construirPolilinha, ultimosNDias } from '../lib/grafico';
import { Badge } from '../componentes/ui/Badge';
import { Carregando, Erro } from '../componentes/ui/Estado';

interface Movimentacao {
  id: string;
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
}

export function FluxoCaixa() {
  const { dados: movimentacoes, carregando, erro } = useApi<Movimentacao[]>('/fluxo-caixa/movimentacoes');

  const { pontosEntradas, pontosSaidas, temDados } = useMemo(() => {
    const dias = ultimosNDias(14);
    const entradasPorDia = new Map(dias.map((d) => [d, 0]));
    const saidasPorDia = new Map(dias.map((d) => [d, 0]));

    for (const m of movimentacoes ?? []) {
      if (m.tipo === 'entrada' && entradasPorDia.has(m.data)) {
        entradasPorDia.set(m.data, entradasPorDia.get(m.data)! + m.valor);
      } else if (m.tipo === 'saida' && saidasPorDia.has(m.data)) {
        saidasPorDia.set(m.data, saidasPorDia.get(m.data)! + m.valor);
      }
    }

    const entradas = dias.map((d) => entradasPorDia.get(d)!);
    const saidas = dias.map((d) => saidasPorDia.get(d)!);
    const maiorValor = Math.max(...entradas, ...saidas);

    return {
      pontosEntradas: construirPolilinha(entradas, 600, 200, 16),
      pontosSaidas: construirPolilinha(saidas, 600, 200, 16),
      temDados: maiorValor > 0,
    };
  }, [movimentacoes]);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-[18px] py-4">
          <h3 className="text-sm font-bold">Entradas × Saídas — últimos 14 dias</h3>
          <div className="flex gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Entradas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red" /> Saídas
            </span>
          </div>
        </div>
        <div className="p-[18px]">
          {temDados ? (
            <svg viewBox="0 0 600 200" width="100%" height="200" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="20" x2="600" y2="20" stroke="#353740" strokeWidth={1} />
              <line x1="0" y1="103" x2="600" y2="103" stroke="#353740" strokeWidth={1} />
              <line x1="0" y1="186" x2="600" y2="186" stroke="#353740" strokeWidth={1} />
              <polyline points={pontosEntradas} fill="none" stroke="#09bc8a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={pontosSaidas} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <p className="py-8 text-center text-[13px] text-text-secondary">Sem movimentações registradas nos últimos 14 dias.</p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="border-b border-border px-[18px] py-4">
          <h3 className="text-sm font-bold">Últimas Movimentações</h3>
        </div>
        {carregando && (
          <div className="p-[18px]">
            <Carregando />
          </div>
        )}
        {erro && (
          <div className="p-[18px]">
            <Erro mensagem={erro} />
          </div>
        )}
        {movimentacoes && movimentacoes.length === 0 && (
          <p className="p-[18px] text-[13px] text-text-secondary">Nenhuma movimentação cadastrada.</p>
        )}
        {movimentacoes && movimentacoes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Data</th>
                  <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Descrição</th>
                  <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Tipo</th>
                  <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Valor</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((mov) => (
                  <tr key={mov.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                    <td className="px-[18px] py-3">{formatarData(mov.data)}</td>
                    <td className="px-[18px] py-3">{mov.descricao}</td>
                    <td className="px-[18px] py-3">
                      <Badge variante={mov.tipo === 'entrada' ? 'brand' : 'red'}>{mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}</Badge>
                    </td>
                    <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{formatarMoeda(mov.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
