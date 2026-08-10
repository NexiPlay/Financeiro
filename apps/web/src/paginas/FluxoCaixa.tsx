import { useApi } from '../lib/useApi';
import { formatarData, formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Carregando, Erro } from '../componentes/ui/Estado';

interface Movimentacao {
  id: string;
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
}

const ENTRADAS =
  '0,124.1 46.2,110.3 92.3,134.4 138.5,89.7 184.6,75.9 230.8,100 276.9,82.8 323.1,65.6 369.2,86.2 415.4,55.3 461.5,41.5 507.7,62.2 553.8,48.4 600,31.2';
const SAIDAS =
  '0,144.7 46.2,134.4 92.3,124.1 138.5,137.8 184.6,117.2 230.8,131 276.9,110.3 323.1,120.6 369.2,100 415.4,113.8 461.5,124.1 507.7,103.4 553.8,117.2 600,127.5';

export function FluxoCaixa() {
  const { dados: movimentacoes, carregando, erro } = useApi<Movimentacao[]>('/fluxo-caixa/movimentacoes');

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
          <svg viewBox="0 0 600 200" width="100%" height="200" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="20" x2="600" y2="20" stroke="#353740" strokeWidth={1} />
            <line x1="0" y1="103" x2="600" y2="103" stroke="#353740" strokeWidth={1} />
            <line x1="0" y1="186" x2="600" y2="186" stroke="#353740" strokeWidth={1} />
            <polyline points={ENTRADAS} fill="none" stroke="#09bc8a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={600} cy={31.2} r={3.5} fill="#09bc8a" />
            <polyline points={SAIDAS} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={600} cy={127.5} r={3.5} fill="#ef4444" />
          </svg>
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
        {movimentacoes && (
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
