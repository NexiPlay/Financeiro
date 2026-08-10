import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi';
import { formatarMoeda } from '../lib/formatadores';
import { Card, CardLabel, CardValor, CardSub } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';

interface Indicadores {
  saldoEmCaixa: number;
  aPagar: { total: number; quantidade: number };
  aReceber: { total: number; quantidade: number };
  folhaDoMes: { total: number; funcionarios: number };
}

interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: 'pendente' | 'atrasado' | 'pago';
}

interface LogAuditoria {
  id: string;
  usuario: string;
  acao: string;
}

const PONTOS_SPARKLINE =
  '0,30.5 9.2,28.9 18.5,32 27.7,26.6 36.9,22.7 46.2,24.3 55.4,18.9 64.6,15 73.9,16.6 83.1,11.2 92.3,7.3 101.5,8.9 110.8,5.8 120,4';

export function Dashboard() {
  const { dados: indicadores, carregando: carregandoIndicadores, erro: erroIndicadores } = useApi<Indicadores>('/dashboard/indicadores');
  const { dados: contasPagar, carregando: carregandoContas } = useApi<ContaPagar[]>('/contas-pagar');
  const { dados: logs, carregando: carregandoLogs } = useApi<LogAuditoria[]>('/auditoria');

  if (carregandoIndicadores) return <Carregando />;
  if (erroIndicadores) return <Erro mensagem={erroIndicadores} />;
  if (!indicadores) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card destaque>
          <CardLabel destaque>Saldo em caixa</CardLabel>
          <CardValor>{formatarMoeda(indicadores.saldoEmCaixa)}</CardValor>
          <svg viewBox="0 0 120 36" width="100%" height="34" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#09bc8a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#09bc8a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={`${PONTOS_SPARKLINE} 120,34 0,34`} fill="url(#sparkFill)" />
            <polyline points={PONTOS_SPARKLINE} fill="none" stroke="#09bc8a" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={120} cy={4} r={2.6} fill="#09bc8a" />
          </svg>
          <CardSub>Tendência dos últimos 14 dias</CardSub>
        </Card>

        <Card>
          <CardLabel>A pagar (7 dias)</CardLabel>
          <CardValor>{formatarMoeda(indicadores.aPagar.total)}</CardValor>
          <CardSub>{indicadores.aPagar.quantidade} lançamentos</CardSub>
        </Card>

        <Card>
          <CardLabel>A receber (7 dias)</CardLabel>
          <CardValor>{formatarMoeda(indicadores.aReceber.total)}</CardValor>
          <CardSub>{indicadores.aReceber.quantidade} lançamentos</CardSub>
        </Card>

        <Card>
          <CardLabel>Folha do mês</CardLabel>
          <CardValor>{formatarMoeda(indicadores.folhaDoMes.total)}</CardValor>
          <CardSub>{indicadores.folhaDoMes.funcionarios} funcionários</CardSub>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-4">
            <h3 className="text-sm font-bold">Contas a Pagar</h3>
            <Link to="/contas-pagar" className="text-[12.5px] text-text-secondary hover:text-brand">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            {carregandoContas || !contasPagar ? (
              <div className="p-[18px]">
                <Carregando />
              </div>
            ) : (
              <table className="w-full min-w-[420px] text-[13px]">
                <tbody>
                  {contasPagar.slice(0, 5).map((conta) => (
                    <tr key={conta.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                      <td className="px-[18px] py-3">
                        <div className="font-semibold">{conta.fornecedor}</div>
                        <div className="text-xs text-text-secondary">{conta.descricao}</div>
                      </td>
                      <td className="px-[18px] py-3 text-right font-semibold [font-variant-numeric:tabular-nums]">
                        {formatarMoeda(conta.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
          <div className="border-b border-border px-[18px] py-4">
            <h3 className="text-sm font-bold">Log de Auditoria</h3>
          </div>
          {carregandoLogs || !logs ? (
            <div className="p-[18px]">
              <Carregando />
            </div>
          ) : (
            <div className="flex flex-col">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="border-b border-border px-[18px] py-3 text-[12.5px] text-text-secondary last:border-0">
                  <b className="font-semibold text-text-primary">{log.usuario}</b> {log.acao}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
