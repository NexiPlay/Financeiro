import { FormEvent, useMemo, useState } from 'react';
import { useApi } from '../lib/useApi';
import { apiPost } from '../lib/api';
import { formatarData, formatarMoeda } from '../lib/formatadores';
import { Badge } from '../componentes/ui/Badge';
import { Card, CardLabel, CardValor } from '../componentes/ui/Card';
import { Carregando, Erro } from '../componentes/ui/Estado';
import { Campo, classeInput, Modal } from '../componentes/ui/Modal';

type Status = 'ativo' | 'afastado';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  admissao: string;
  salarioBase: number;
  status: Status;
}

const ABAS: { valor: Status | 'todos'; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativo', rotulo: 'Ativos' },
  { valor: 'afastado', rotulo: 'Afastados' },
];

const FORMULARIO_INICIAL = { nome: '', cargo: '', departamento: '', admissao: '', salarioBase: '', status: 'ativo' as Status };

export function Funcionarios() {
  const { dados: funcionarios, carregando, erro, recarregar } = useApi<Funcionario[]>('/funcionarios');
  const [aba, setAba] = useState<Status | 'todos'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    if (!funcionarios) return [];
    return aba === 'todos' ? funcionarios : funcionarios.filter((f) => f.status === aba);
  }, [funcionarios, aba]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErroFormulario(null);
    try {
      await apiPost('/funcionarios', { ...formulario, salarioBase: Number(formulario.salarioBase) });
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
  if (erro)
    return (
      <Erro mensagem={`${erro} — este endpoint exige um token de acesso válido (@Roles('admin', 'rh')); ainda não há login real conectado`} />
    );
  if (!funcionarios) return null;

  const ativos = funcionarios.filter((f) => f.status === 'ativo').length;
  const afastados = funcionarios.filter((f) => f.status === 'afastado').length;

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
          + Novo funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Total de funcionários</CardLabel>
          <CardValor>{funcionarios.length}</CardValor>
        </Card>
        <Card>
          <CardLabel>Ativos</CardLabel>
          <CardValor>{ativos}</CardValor>
        </Card>
        <Card>
          <CardLabel>Afastados</CardLabel>
          <CardValor>{afastados}</CardValor>
        </Card>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Nome</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Cargo</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Departamento</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Admissão</th>
                <th className="px-[18px] py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Salário base</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="px-[18px] py-3 font-semibold">{f.nome}</td>
                  <td className="px-[18px] py-3">{f.cargo}</td>
                  <td className="px-[18px] py-3">{f.departamento}</td>
                  <td className="px-[18px] py-3">{formatarData(f.admissao)}</td>
                  <td className="px-[18px] py-3 text-right [font-variant-numeric:tabular-nums]">{formatarMoeda(f.salarioBase)}</td>
                  <td className="px-[18px] py-3">
                    <Badge variante={f.status === 'ativo' ? 'brand' : 'yellow'}>{f.status === 'ativo' ? 'Ativo' : 'Afastado'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo="Novo funcionário" aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar} className="flex flex-col gap-3">
          <Campo rotulo="Nome">
            <input required className={classeInput} value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Cargo">
            <input required className={classeInput} value={formulario.cargo} onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })} />
          </Campo>
          <Campo rotulo="Departamento">
            <input required className={classeInput} value={formulario.departamento} onChange={(e) => setFormulario({ ...formulario, departamento: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Admissão">
              <input required type="date" className={classeInput} value={formulario.admissao} onChange={(e) => setFormulario({ ...formulario, admissao: e.target.value })} />
            </Campo>
            <Campo rotulo="Salário base">
              <input required type="number" min="0" step="0.01" className={classeInput} value={formulario.salarioBase} onChange={(e) => setFormulario({ ...formulario, salarioBase: e.target.value })} />
            </Campo>
          </div>
          <Campo rotulo="Status">
            <select className={classeInput} value={formulario.status} onChange={(e) => setFormulario({ ...formulario, status: e.target.value as Status })}>
              <option value="ativo">Ativo</option>
              <option value="afastado">Afastado</option>
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
