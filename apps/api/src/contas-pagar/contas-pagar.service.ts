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

@Injectable()
export class ContasPagarService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaPagar[]> {
    const contas = await this.prisma.contaPagar.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => ({
      id: c.id,
      fornecedor: c.fornecedor,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaPagar,
    }));
  }
}
