export type Papel = 'admin' | 'financeiro' | 'rh';

export type StatusContaPagar = 'pendente' | 'atrasado' | 'pago';
export type StatusContaReceber = 'pendente' | 'atrasado' | 'recebido';
export type StatusFuncionario = 'ativo' | 'afastado';
export type StatusFolha = 'em_aberto' | 'processada';

export interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaPagar;
}

export interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaReceber;
}

export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  admissao: string;
  salarioBase: number;
  status: StatusFuncionario;
}

export interface CompetenciaFolha {
  id: string;
  competencia: string;
  totalFuncionarios: number;
  proventos: number | null;
  descontos: number | null;
  liquido: number | null;
  status: StatusFolha;
}

export interface LogAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  modulo: string;
}
