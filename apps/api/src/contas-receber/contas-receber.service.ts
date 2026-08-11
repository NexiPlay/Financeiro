import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dividirValorEmParcelas, adicionarMeses } from '../comum/parcelamento';

export type StatusContaReceber = 'pendente' | 'atrasado' | 'recebido';

export interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaReceber;
  parcelaAtual: number | null;
  totalParcelas: number | null;
}

export interface CriarContaReceberInput {
  cliente: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaReceber;
  parcelas?: number;
}

@Injectable()
export class ContasReceberService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaReceber[]> {
    const contas = await this.prisma.contaReceber.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => this.mapear(c));
  }

  async criar(dados: CriarContaReceberInput): Promise<ContaReceber[]> {
    const totalParcelas = dados.parcelas && dados.parcelas > 1 ? dados.parcelas : 1;
    const valores = dividirValorEmParcelas(dados.valor, totalParcelas);
    const vencimentoBase = new Date(dados.vencimento);

    const criadas: Awaited<ReturnType<typeof this.prisma.contaReceber.create>>[] = [];
    for (let i = 0; i < totalParcelas; i++) {
      const conta = await this.prisma.contaReceber.create({
        data: {
          cliente: dados.cliente,
          descricao: totalParcelas > 1 ? `${dados.descricao} (${i + 1}/${totalParcelas})` : dados.descricao,
          vencimento: adicionarMeses(vencimentoBase, i),
          valor: valores[i],
          status: dados.status,
          parcelaAtual: totalParcelas > 1 ? i + 1 : null,
          totalParcelas: totalParcelas > 1 ? totalParcelas : null,
        },
      });
      criadas.push(conta);
    }
    return criadas.map((c) => this.mapear(c));
  }

  async atualizar(id: string, dados: CriarContaReceberInput): Promise<ContaReceber> {
    const conta = await this.prisma.contaReceber.update({
      where: { id },
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
    parcelaAtual: number | null;
    totalParcelas: number | null;
  }): ContaReceber {
    return {
      id: c.id,
      cliente: c.cliente,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaReceber,
      parcelaAtual: c.parcelaAtual,
      totalParcelas: c.totalParcelas,
    };
  }
}
