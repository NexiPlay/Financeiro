import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../autenticacao/AuthContext';
import {
  IconeDashboard,
  IconeContasPagar,
  IconeContasReceber,
  IconeFluxoCaixa,
  IconeFuncionarios,
  IconeFolhaPagamento,
  IconeAuditoria,
  IconeUsuarios,
} from './ui/icones';

const NAV = [
  { grupo: null, itens: [{ para: '/', rotulo: 'Dashboard', Icone: IconeDashboard, somenteAdmin: false }] },
  {
    grupo: 'Financeiro',
    itens: [
      { para: '/contas-pagar', rotulo: 'Contas a Pagar', Icone: IconeContasPagar, somenteAdmin: false },
      { para: '/contas-receber', rotulo: 'Contas a Receber', Icone: IconeContasReceber, somenteAdmin: false },
      { para: '/fluxo-caixa', rotulo: 'Fluxo de Caixa', Icone: IconeFluxoCaixa, somenteAdmin: false },
    ],
  },
  {
    grupo: 'Pessoas',
    itens: [
      { para: '/funcionarios', rotulo: 'Funcionários', Icone: IconeFuncionarios, somenteAdmin: false },
      { para: '/folha-pagamento', rotulo: 'Folha de Pagamento', Icone: IconeFolhaPagamento, somenteAdmin: false },
    ],
  },
  {
    grupo: 'Sistema',
    itens: [
      { para: '/auditoria', rotulo: 'Log de Auditoria', Icone: IconeAuditoria, somenteAdmin: false },
      { para: '/usuarios', rotulo: 'Usuários', Icone: IconeUsuarios, somenteAdmin: true },
    ],
  },
];

const TITULOS: Record<string, string> = {
  '/': 'Dashboard',
  '/contas-pagar': 'Contas a Pagar',
  '/contas-receber': 'Contas a Receber',
  '/fluxo-caixa': 'Fluxo de Caixa',
  '/funcionarios': 'Funcionários',
  '/folha-pagamento': 'Folha de Pagamento',
  '/auditoria': 'Log de Auditoria',
  '/usuarios': 'Usuários',
};

function MarcaHub() {
  return (
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand shadow-[0_0_16px_rgba(9,188,138,0.28)]">
      <svg viewBox="0 0 24 24" fill="#15161b" className="h-4 w-4">
        <rect x="4" y="14" width="4" height="6" rx="1" />
        <rect x="10" y="9" width="4" height="11" rx="1" />
        <rect x="16" y="4" width="4" height="16" rx="1" />
      </svg>
    </div>
  );
}

export function AppShell() {
  const { usuario, sair } = useAuth();
  const location = useLocation();
  const titulo = TITULOS[location.pathname] ?? 'Hub';

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-border bg-bg-card p-3.5 pb-4">
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <MarcaHub />
          <span className="text-base font-bold tracking-tight">Hub</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Navegação principal">
          {NAV.map((secao, i) => (
            <div key={i}>
              {secao.grupo && (
                <div className="mt-3.5 px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  {secao.grupo}
                </div>
              )}
              {secao.itens
                .filter((item) => !item.somenteAdmin || usuario?.papel === 'admin')
                .map(({ para, rotulo, Icone }) => (
                  <NavLink
                    key={para}
                    to={para}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                        isActive ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      }`
                    }
                  >
                    <Icone className="h-4 w-4 flex-shrink-0" />
                    {rotulo}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>

        <div className="mt-2 flex items-center gap-2.5 border-t border-border pt-4">
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-border bg-bg-hover text-[11px] font-bold">
            {usuario?.nome
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="truncate text-[13px] font-semibold">{usuario?.nome}</span>
            <span className="text-[11px] capitalize text-text-secondary">{usuario?.papel}</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-7 py-[18px]">
          <h1 className="text-lg font-bold tracking-tight">{titulo}</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-border px-3 py-[5px] text-xs font-semibold text-text-secondary">
              Papel: {usuario?.papel}
            </span>
            <button
              type="button"
              onClick={sair}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-5 p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
