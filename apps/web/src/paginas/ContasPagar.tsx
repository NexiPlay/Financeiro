import { FormEvent, useMemo, useState } from 'react';
import { useApi } from '../lib/useApi';
import { apiPost } from '../lib/api';
import { formatarData, formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Card, CardLabel, CardValor, CardSub } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';
import { Campo, classeInput, Modal } from '../componentes/ui/Modal';

type Status = 'pendente' | 'atrasado' | 'pago';

interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: Status;
}

const ABAS: { valor: Status | 'todas'; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'atrasado', rotulo: 'Atrasado' },
  { valor: 'pago', rotulo: 'Pago' },
];

const BADGE_POR_STATUS = { pendente: 'yellow', atrasado: 'red', pago: 'brand' } as const;
const ROTULO_STATUS = { pendente: 'Pendente', atrasado: 'Atrasado', pago: 'Pago' } as const;

const FORMULARIO_INICIAL = { fornecedor: '', descricao: '', vencimento: '', valor: '', status: 'pendente' as Status };

export function ContasPagar() {
  const { dados: contas, carregando, erro, recarregar } = useApi<ContaPagar[]>('/contas-pagar');
  const [aba, setAba] = useState<Status | 'todas'>('todas');
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const contasFiltradas = useMemo(() => {
    if (!contas) return [];
    return aba === 'todas' ? contas : contas.filter((c) => c.status === aba);
  }, [contas, aba]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErroFormulario(null);
    try {
      await apiPost('/contas-pagar', { ...formulario, valor: Number(formulario.valor) });
      setModalAberto(false);
      setFormulario(FORMULARIO_INICIAL);
      recarregar();
    } catch (e) {
      setErroFormulario((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!contas) return null;

  const totalPendente = contas.filter((c) => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
  const totalAtrasado = contas.filter((c) => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const totalPago = contas.filter((c) => c.status === 'pago').reduce((s, c) => s + c.valor, 0);

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
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-main shadow-[0_0_20px_rgba(9,188,138,0.25)] hover:opacity-90"
        >
          + Nova conta a pagar
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
          <CardLabel>Pago</CardLabel>
          <CardValor>{formatarMoeda(totalPago)}</CardValor>
          <CardSub>no total cadastrado</CardSub>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Fornecedor</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Vencimento</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Valor</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {contasFiltradas.map((conta) => (
                <tr key={conta.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="px-[18px] py-3">
                    <div className="font-semibold">{conta.fornecedor}</div>
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

      <Modal titulo="Nova conta a pagar" aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <Campo rotulo="Fornecedor">
            <input required className={classeInput} value={formulario.fornecedor} onChange={(e) => setFormulario({ ...formulario, fornecedor: e.target.value })} />
          </Campo>
          <Campo rotulo="Descrição">
            <input required className={classeInput} value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Vencimento">
              <input required type="date" className={classeInput} value={formulario.vencimento} onChange={(e) => setFormulario({ ...formulario, vencimento: e.target.value })} />
            </Campo>
            <Campo rotulo="Valor">
              <input required type="number" min="0" step="0.01" className={classeInput} value={formulario.valor} onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })} />
            </Campo>
          </div>
          <Campo rotulo="Status">
            <select className={classeInput} value={formulario.status} onChange={(e) => setFormulario({ ...formulario, status: e.target.value as Status })}>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Atrasado</option>
              <option value="pago">Pago</option>
            </select>
          </Campo>
          {erroFormulario && <p className="text-[12.5px] text-red">{erroFormulario}</p>}
          <button
            type="submit"
            disabled={salvando}
            className="mt-1 rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-main hover:opacity-90 disabled:opacity-60"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </>
  );
}
