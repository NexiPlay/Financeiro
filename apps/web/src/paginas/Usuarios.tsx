import { FormEvent, useState } from 'react';
import { useApi } from '../lib/useApi';
import { apiPatch, apiPost } from '../lib/api';
import { formatarData } from '../lib/formatadores';
import { useAuth } from '../autenticacao/AuthContext';
import { Badge } from '../componentes/ui/Badge';
import { Carregando, Erro } from '../componentes/ui/Estado';
import { Campo, classeInput, Modal } from '../componentes/ui/Modal';

type Papel = 'admin' | 'financeiro' | 'rh';

interface Usuario {
  id: string;
  email: string;
  papel: Papel;
  criadoEm: string;
}

const BADGE_POR_PAPEL: Record<Papel, 'brand' | 'yellow' | 'neutral'> = { admin: 'brand', financeiro: 'yellow', rh: 'neutral' };

const FORMULARIO_INICIAL = { email: '', senha: '', papel: 'financeiro' as Papel };

export function Usuarios() {
  const { usuario: usuarioLogado } = useAuth();
  const { dados: usuarios, carregando, erro, recarregar } = useApi<Usuario[]>('/usuarios');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [papelEdicao, setPapelEdicao] = useState<Papel>('financeiro');
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  function abrirNovo() {
    setEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErroFormulario(null);
    setModalAberto(true);
  }

  function abrirEdicao(u: Usuario) {
    setEditando(u);
    setPapelEdicao(u.papel);
    setErroFormulario(null);
    setModalAberto(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErroFormulario(null);
    try {
      if (editando) {
        await apiPatch(`/usuarios/${editando.id}/papel`, { papel: papelEdicao });
      } else {
        await apiPost('/usuarios', formulario);
      }
      setModalAberto(false);
      recarregar();
    } catch (e) {
      setErroFormulario((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;
  if (!usuarios) return null;

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={abrirNovo}
          className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-bg-main shadow-[0_0_20px_rgba(9,188,138,0.25)] hover:opacity-90"
        >
          + Novo usuário
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">E-mail</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Papel</th>
                <th className="px-[18px] py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-text-secondary">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} onClick={() => abrirEdicao(u)} className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-hover">
                  <td className="px-[18px] py-3 font-semibold">
                    {u.email}
                    {u.id === usuarioLogado?.id && <span className="ml-1.5 text-text-secondary">(você)</span>}
                  </td>
                  <td className="px-[18px] py-3">
                    <Badge variante={BADGE_POR_PAPEL[u.papel]}>{u.papel}</Badge>
                  </td>
                  <td className="px-[18px] py-3">{formatarData(u.criadoEm.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={editando ? 'Alterar papel' : 'Novo usuário'} aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar} className="flex flex-col gap-3">
          {editando ? (
            <>
              <p className="text-[12.5px] text-text-secondary">
                Alterando o papel de <b className="text-text-primary">{editando.email}</b>. E-mail e senha não são editáveis por aqui.
              </p>
              <Campo rotulo="Papel">
                <select className={classeInput} value={papelEdicao} onChange={(e) => setPapelEdicao(e.target.value as Papel)}>
                  <option value="admin">admin</option>
                  <option value="financeiro">financeiro</option>
                  <option value="rh">rh</option>
                </select>
              </Campo>
            </>
          ) : (
            <>
              <Campo rotulo="E-mail">
                <input
                  required
                  type="email"
                  className={classeInput}
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Senha">
                <input
                  required
                  type="password"
                  minLength={8}
                  className={classeInput}
                  value={formulario.senha}
                  onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Papel">
                <select
                  className={classeInput}
                  value={formulario.papel}
                  onChange={(e) => setFormulario({ ...formulario, papel: e.target.value as Papel })}
                >
                  <option value="admin">admin</option>
                  <option value="financeiro">financeiro</option>
                  <option value="rh">rh</option>
                </select>
              </Campo>
            </>
          )}
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
