import { useApi } from '../lib/useApi';
import { formatarDataHora } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Carregando, Erro } from '../componentes/ui/Estado';

interface LogAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  modulo: string;
}

export function Auditoria() {
  const { dados: logs, carregando, erro } = useApi<LogAuditoria[]>('/auditoria');

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!logs) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Data/Hora</th>
              <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Usuário</th>
              <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Ação</th>
              <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Módulo</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                <td className="px-[18px] py-3 [font-variant-numeric:tabular-nums]">{formatarDataHora(log.dataHora)}</td>
                <td className="px-[18px] py-3 font-semibold">{log.usuario}</td>
                <td className="px-[18px] py-3">{log.acao}</td>
                <td className="px-[18px] py-3">
                  <Badge variante="neutral">{log.modulo}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
