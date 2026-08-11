import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dividirValorEmParcelas, adicionarMeses } from '../comum/parcelamento';

export type StatusContaPagar = 'pendente' | 'atrasado' | 'pago';

export interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaPagar;
  parcelaAtual: number | null;
  totalParcelas: number | null;
}

export interface CriarContaPagarInput {
  fornecedor: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: StatusContaPagar;
  parcelas?: number;
}

@Injectable()
export class ContasPagarService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<ContaPagar[]> {
    const contas = await this.prisma.contaPagar.findMany({ orderBy: { vencimento: 'asc' } });
    return contas.map((c) => this.mapear(c));
  }

  async criar(dados: CriarContaPagarInput): Promise<ContaPagar[]> {
    const totalParcelas = dados.parcelas && dados.parcelas > 1 ? dados.parcelas : 1;
    const valores = dividirValorEmParcelas(dados.valor, totalParcelas);
    const vencimentoBase = new Date(dados.vencimento);

    const criadas: Awaited<ReturnType<typeof this.prisma.contaPagar.create>>[] = [];
    for (let i = 0; i < totalParcelas; i++) {
      const conta = await this.prisma.contaPagar.create({
        data: {
          fornecedor: dados.fornecedor,
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

  async atualizar(id: string, dados: CriarContaPagarInput): Promise<ContaPagar> {
    const conta = await this.prisma.contaPagar.update({
      where: { id },
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
    parcelaAtual: number | null;
    totalParcelas: number | null;
  }): ContaPagar {
    return {
      id: c.id,
      fornecedor: c.fornecedor,
      descricao: c.descricao,
      vencimento: c.vencimento.toISOString().slice(0, 10),
      valor: c.valor.toNumber(),
      status: c.status as StatusContaPagar,
      parcelaAtual: c.parcelaAtual,
      totalParcelas: c.totalParcelas,
    };
  }
}
