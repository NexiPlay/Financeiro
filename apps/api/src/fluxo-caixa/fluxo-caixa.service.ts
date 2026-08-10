import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MovimentacaoCaixa {
  id: string;
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
}

@Injectable()
export class FluxoCaixaService {
  constructor(private readonly prisma: PrismaService) {}

  async listarMovimentacoes(): Promise<MovimentacaoCaixa[]> {
    const movimentacoes = await this.prisma.movimentacaoCaixa.findMany({ orderBy: { data: 'desc' } });
    return movimentacoes.map((m) => ({
      id: m.id,
      data: m.data.toISOString().slice(0, 10),
      descricao: m.descricao,
      tipo: m.tipo as 'entrada' | 'saida',
      valor: m.valor.toNumber(),
    }));
  }

  async resumo() {
    const movimentacoes = await this.listarMovimentacoes();
    const entradas = movimentacoes.filter((m) => m.tipo === 'entrada').reduce((soma, m) => soma + m.valor, 0);
    const saidas = movimentacoes.filter((m) => m.tipo === 'saida').reduce((soma, m) => soma + m.valor, 0);
    return { saldoEmCaixa: entradas - saidas, entradas, saidas };
  }
}
