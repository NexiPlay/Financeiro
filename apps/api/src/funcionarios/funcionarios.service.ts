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

export interface CriarFuncionarioInput {
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
    return funcionarios.map((f) => this.mapear(f));
  }

  async criar(dados: CriarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.prisma.funcionario.create({
      data: {
        nome: dados.nome,
        cargo: dados.cargo,
        departamento: dados.departamento,
        admissao: new Date(dados.admissao),
        salarioBase: dados.salarioBase,
        status: dados.status,
      },
    });
    return this.mapear(funcionario);
  }

  async atualizar(id: string, dados: CriarFuncionarioInput): Promise<Funcionario> {
    const funcionario = await this.prisma.funcionario.update({
      where: { id },
      data: {
        nome: dados.nome,
        cargo: dados.cargo,
        departamento: dados.departamento,
        admissao: new Date(dados.admissao),
        salarioBase: dados.salarioBase,
        status: dados.status,
      },
    });
    return this.mapear(funcionario);
  }

  private mapear(f: {
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
    admissao: Date;
    salarioBase: { toNumber(): number };
    status: string;
  }): Funcionario {
    return {
      id: f.id,
      nome: f.nome,
      cargo: f.cargo,
      departamento: f.departamento,
      admissao: f.admissao.toISOString().slice(0, 10),
      salarioBase: f.salarioBase.toNumber(),
      status: f.status as StatusFuncionario,
    };
  }
}
