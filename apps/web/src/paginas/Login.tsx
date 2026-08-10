import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../autenticacao/AuthContext';

export function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await entrar(email, senha);
      navigate('/', { replace: true });
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -inset-[20%]"
        style={{ background: 'radial-gradient(circle at 50% 28%, rgba(9,188,138,0.16), transparent 60%)' }}
      />

      <div className="relative z-10 flex w-full max-w-[380px] flex-col gap-[22px] rounded-2xl border border-border bg-bg-card p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand shadow-[0_0_16px_rgba(9,188,138,0.28)]">
            <svg viewBox="0 0 24 24" fill="#15161b" className="h-4 w-4">
              <rect x="4" y="14" width="4" height="6" rx="1" />
              <rect x="10" y="9" width="4" height="11" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">Hub</span>
            <span className="text-[10px] uppercase tracking-widest text-text-secondary">por Nexi</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">Entrar no Hub</h1>
          <p className="mt-1 text-sm text-text-secondary">Use sua conta Nexi para continuar.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={aoSubmeter}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              placeholder="voce@nexiplay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-main px-3.5 py-[11px] text-sm text-text-primary placeholder:text-text-secondary focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-main px-3.5 py-[11px] text-sm text-text-primary placeholder:text-text-secondary focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15"
            />
          </div>

          <div className="-mt-1.5 flex justify-end">
            <button type="button" className="text-[12.5px] text-text-secondary hover:text-brand">
              Esqueci minha senha
            </button>
          </div>

          {erro && <p className="-mt-1 text-[12.5px] text-red">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-bg-main shadow-[0_0_20px_rgba(9,188,138,0.25)] hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-[11.5px] text-text-secondary">
          Acesso restrito a colaboradores Nexi · problemas para entrar? Fale com o financeiro.
        </p>
      </div>
    </div>
  );
}
