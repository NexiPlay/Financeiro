import { useState } from 'react';
import { useApi } from '../lib/useApi';
import { apiPost } from '../lib/api';
import { formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Card, CardLabel, CardValor, CardSub } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';

type Status = 'em_aberto' | 'processada';

interface CompetenciaFolha {
  id: string | null;
  competencia: string;
  totalFuncionarios: number;
  proventos: number | null;
  descontos: number | null;
  liquido: number | null;
  status: Status;
}

export function FolhaPagamento() {
  const { dados: competencias, carregando, erro, recarregar } = useApi<CompetenciaFolha[]>('/folha-pagamento');
  const [processando, setProcessando] = useState(false);
  const [erroProcessamento, setErroProcessamento] = useState<string | null>(null);

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!competencias) return null;

  const atual = competencias[0];

  async function processarFolha() {
    setProcessando(true);
    setErroProcessamento(null);
    try {
      await apiPost('/folha-pagamento/processar', {});
      recarregar();
    } catch (e) {
      setErroProcessamento((e as Error).message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Proventos {atual?.status === 'em_aberto' ? '(estimado)' : '(bruto)'}</CardLabel>
          <CardValor>{atual?.proventos != null ? formatarMoeda(atual.proventos) : '—'}</CardValor>
          <CardSub>Competência {atual?.competencia}</CardSub>
        </Card>
        <Card>
          <CardLabel>Descontos</CardLabel>
          <CardValor>{atual?.descontos != null ? formatarMoeda(atual.descontos) : '—'}</CardValor>
          <CardSub>ainda não calculados automaticamente</CardSub>
        </Card>
        <Card destaque>
          <CardLabel destaque>Líquido</CardLabel>
          <CardValor>{atual?.liquido != null ? formatarMoeda(atual.liquido) : '—'}</CardValor>
          <CardSub>{atual?.totalFuncionarios} funcionários ativos</CardSub>
        </Card>
      </div>

      {atual?.status === 'em_aberto' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/25 bg-brand/5 px-[18px] py-4">
          <p className="text-[12.5px] text-text-secondary">
            Competência <b className="text-text-primary">{atual.competencia}</b> ainda não foi processada — os valores acima são uma estimativa
            com base nos funcionários ativos hoje.
          </p>
          <button
            type="button"
            onClick={processarFolha}
            disabled={processando}
            className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-main shadow-[0_0_20px_rgba(9,188,138,0.25)] hover:opacity-90 disabled:opacity-60"
          >
            {processando ? 'Processando…' : 'Processar folha do mês'}
          </button>
        </div>
      )}
      {erroProcessamento && <p className="text-[12.5px] text-red">{erroProcessamento}</p>}

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="border-b border-border px-[18px] py-4">
          <h3 className="text-sm font-bold">Competências</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Competência</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Funcionários</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Proventos</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Descontos</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Líquido</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {competencias.map((c) => (
                <tr key={c.id ?? c.competencia} className="border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="px-[18px] py-3 font-semibold">{c.competencia}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{c.totalFuncionarios}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{c.proventos != null ? formatarMoeda(c.proventos) : '—'}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{c.descontos != null ? formatarMoeda(c.descontos) : '—'}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{c.liquido != null ? formatarMoeda(c.liquido) : '—'}</td>
                  <td className="px-[18px] py-3">
                    <Badge variante={c.status === 'processada' ? 'brand' : 'yellow'}>{c.status === 'processada' ? 'Processada' : 'Em aberto'}</Badge>
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
