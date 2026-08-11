import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatusContaReceber = 'pendente' | 'atrasado' | 'recebido';

export interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaReceber;
}

export interface CriarContaReceberInput {
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaReceber;
}

@Injectable()
export class ContasReceberService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaReceber[]> {
    const contas = await this.prisma.contaReceber.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => this.mapear(c));
  }

  async criar(dados: CriarContaReceberInput): Promise<ContaReceber> {
    const conta = await this.prisma.contaReceber.create({
      data: {
        cliente: dados.cliente,
        descricao: dados.descricao,
        vencimento: new Date(dados.vencimento),
        valor: dados.valor,
        status: dados.status,
      },
    });
    return this.mapear(conta);
  }

  private mapear(c: {
    id: string;
    cliente: string;
    descricao: string;
    vencimento: Date;
    valor: { toNumber(): number };
    status: string;
  }): ContaReceber {
    return {
      id: c.id,
      cliente: c.cliente,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaReceber,
    };
  }
}
