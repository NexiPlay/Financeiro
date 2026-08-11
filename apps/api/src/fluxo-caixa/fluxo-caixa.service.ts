import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type TipoMovimentacao = 'entrada' | 'saida';

export interface MovimentacaoCaixa {
  id: string;
  data: string;
  descricao: string;
  tipo: TipoMovimentacao;
  valor: number;
}

export interface CriarMovimentacaoInput {
  data: string;
  descricao: string;
  tipo: TipoMovimentacao;
  valor: number;
}

@Injectable()
export class FluxoCaixaService {
  constructor(private readonly prisma: PrismaService) {}

  async listarMovimentacoes(): Promise<MovimentacaoCaixa[]> {
    const movimentacoes = await this.prisma.movimentacaoCaixa.findMany({ orderBy: { data: 'desc' } });
    return movimentacoes.map((m) => this.mapear(m));
  }

  async criar(dados: CriarMovimentacaoInput): Promise<MovimentacaoCaixa> {
    const movimentacao = await this.prisma.movimentacaoCaixa.create({
      data: {
        data: new Date(dados.data),
        descricao: dados.descricao,
        tipo: dados.tipo,
        valor: dados.valor,
      },
    });
    return this.mapear(movimentacao);
  }

  async resumo() {
    const movimentacoes = await this.listarMovimentacoes();
    const entradas = movimentacoes.filter((m) => m.tipo === 'entrada').reduce((soma, m) => soma + m.valor, 0);
    const saidas = movimentacoes.filter((m) => m.tipo === 'saida').reduce((soma, m) => soma + m.valor, 0);
    return { saldoEmCaixa: entradas - saidas, entradas, saidas };
  }

  private mapear(m: { id: string; data: Date; descricao: string; tipo: string; valor: { toNumber(): number } }): MovimentacaoCaixa {
    return {
      id: m.id,
      data: m.data.toISOString().slice(0, 10),
      descricao: m.descricao,
      tipo: m.tipo as TipoMovimentacao,
      valor: m.valor.toNumber(),
    };
  }
}
