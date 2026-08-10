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

@Injectable()
export class ContasReceberService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaReceber[]> {
    const contas = await this.prisma.contaReceber.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => ({
      id: c.id,
      cliente: c.cliente,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaReceber,
    }));
  }
}
