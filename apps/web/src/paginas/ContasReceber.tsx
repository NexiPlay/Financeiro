import { useMemo, useState } from 'react';
import { useApi } from '../lib/useApi';
import { formatarData, formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Card, CardLabel, CardValor } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';

type Status = 'pendente' | 'atrasado' | 'recebido';

interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: Status;
}

const ABAS: { valor: Status | 'todas'; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'atrasado', rotulo: 'Atrasado' },
  { valor: 'recebido', rotulo: 'Recebido' },
];

const BADGE_POR_STATUS = { pendente: 'yellow', atrasado: 'red', recebido: 'brand' } as const;
const ROTULO_STATUS = { pendente: 'Pendente', atrasado: 'Atrasado', recebido: 'Recebido' } as const;

export function ContasReceber() {
  const { dados: contas, carregando, erro } = useApi<ContaReceber[]>('/contas-receber');
  const [aba, setAba] = useState<Status | 'todas'>('todas');

  const contasFiltradas = useMemo(() => {
    if (!contas) return [];
    return aba === 'todas' ? contas : contas.filter((c) => c.status === aba);
  }, [contas, aba]);

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!contas) return null;

  const totalPendente = contas.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
  const totalAtrasado = contas.filter((c) => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const totalRecebido = contas.filter((c) => c.status === 'recebido').reduce((s, c) => s + c.valor, 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {ABAS.map((item) => (
            <button
              key={item.valor}
              type="button"
              onClick={() => setAba(item.valor)}
              className={`rounded-lg px-3.5 py-[7px] text-[12.5px] font-semibold ${
                aba === item.valor ? 'border border-brand/25 bg-brand/10 text-brand' : 'border border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
        <button type="button" className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-main shadow-[0_0_20px_rgba(9,188,138,0.25)] hover:opacity-90">
          + Nova conta a receber
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Pendente</CardLabel>
          <CardValor>{formatarMoeda(totalPendente)}</CardValor>
        </Card>
        <Card>
          <CardLabel>Atrasado</CardLabel>
          <CardValor>{formatarMoeda(totalAtrasado)}</CardValor>
        </Card>
        <Card>
          <CardLabel>Recebido</CardLabel>
          <CardValor>{formatarMoeda(totalRecebido)}</CardValor>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Cliente</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Vencimento</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Valor</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {contasFiltradas.map((conta) => (
                <tr key={conta.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="px-[18px] py-3">
                    <div className="font-semibold">{conta.cliente}</div>
                    <div className="text-xs text-text-secondary">{conta.descricao}</div>
                  </td>
                  <td className="px-[18px] py-3">{formatarData(conta.vencimento)}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{formatarMoeda(conta.valor)}</td>
                  <td className="px-[18px] py-3">
                    <Badge variante={BADGE_POR_STATUS[conta.status]}>{ROTULO_STATUS[conta.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
