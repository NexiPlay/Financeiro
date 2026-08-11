import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatusContaPagar = 'pendente' | 'atrasado' | 'pago';

export interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaPagar;
}

export interface CriarContaPagarInput {
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaPagar;
}

@Injectable()
export class ContasPagarService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaPagar[]> {
    const contas = await this.prisma.contaPagar.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => this.mapear(c));
  }

  async criar(dados: CriarContaPagarInput): Promise<ContaPagar> {
    const conta = await this.prisma.contaPagar.create({
      data: {
        fornecedor: dados.fornecedor,
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
    fornecedor: string;
    descricao: string;
    vencimento: Date;
    valor: { toNumber(): number };
    status: string;
  }): ContaPagar {
    return {
      id: c.id,
      fornecedor: c.fornecedor,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaPagar,
    };
  }
}
