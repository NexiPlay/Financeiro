import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatusFuncionario = 'ativo' | 'afastado';

export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  admissao: string;
  salarioBase: number;
  status: StatusFuncionario;
}

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Funcionario[]> {
    const funcionarios = await this.prisma.funcionario.findMany({ orderBy: { nome: 'asc' } });
    return funcionarios.map((f) => ({
      id: f.id,
      nome: f.nome,
      cargo: f.cargo,
      departamento: f.departamento,
      admissao: f.admissao.toISOString().slice(0, 10),
      salarioBase: f.salarioBase.toNumber(),
      status: f.status as StatusFuncionario,
    }));
  }
}
