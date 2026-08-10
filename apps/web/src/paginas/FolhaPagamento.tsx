import { useApi } from '../lib/useApi';
import { formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Card, CardLabel, CardValor, CardSub } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';

type Status = 'em_aberto' | 'processada';

interface CompetenciaFolha {
  id: string;
  competencia: string;
  totalFuncionarios: number;
  proventos: number | null;
  descontos: number | null;
  liquido: number | null;
  status: Status;
}

export function FolhaPagamento() {
  const { dados: competencias, carregando, erro } = useApi<CompetenciaFolha[]>('/folha-pagamento');

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!competencias) return null;

  const ultimaProcessada = competencias.find((c) => c.status === 'processada');

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Proventos (bruto)</CardLabel>
          <CardValor>{ultimaProcessada?.proventos != null ? formatarMoeda(ultimaProcessada.proventos) : '—'}</CardValor>
          <CardSub>Competência {ultimaProcessada?.competencia}</CardSub>
        </Card>
        <Card>
          <CardLabel>Descontos</CardLabel>
          <CardValor>{ultimaProcessada?.descontos != null ? formatarMoeda(ultimaProcessada.descontos) : '—'}</CardValor>
        </Card>
        <Card destaque>
          <CardLabel destaque>Líquido</CardLabel>
          <CardValor>{ultimaProcessada?.liquido != null ? formatarMoeda(ultimaProcessada.liquido) : '—'}</CardValor>
          <CardSub>{ultimaProcessada?.totalFuncionarios} funcionários</CardSub>
        </Card>
      </div>

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
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
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
