import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './autenticacao/AuthContext';
import { RotaProtegida } from './autenticacao/RotaProtegida';
import { AppShell } from './componentes/AppShell';
import { Login } from './paginas/Login';
import { Dashboard } from './paginas/Dashboard';
import { ContasPagar } from './paginas/ContasPagar';
import { ContasReceber } from './paginas/ContasReceber';
import { FluxoCaixa } from './paginas/FluxoCaixa';
import { Funcionarios } from './paginas/Funcionarios';
import { FolhaPagamento } from './paginas/FolhaPagamento';
import { Auditoria } from './paginas/Auditoria';
import { Usuarios } from './paginas/Usuarios';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RotaProtegida />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
            <Route path="/contas-receber" element={<ContasReceber />} />
            <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/folha-pagamento" element={<FolhaPagamento />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
