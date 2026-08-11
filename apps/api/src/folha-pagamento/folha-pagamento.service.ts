import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FuncionariosService } from '../funcionarios/funcionarios.service';

export type StatusFolha = 'em_aberto' | 'processada';

export interface CompetenciaFolha {
  id: string | null;
  competencia: string;
  totalFuncionarios: number;
  proventos: number | null;
  descontos: number | null;
  liquido: number | null;
  status: StatusFolha;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function competenciaAtual(): string {
  const agora = new Date();
  return `${MESES[agora.getMonth()]}/${agora.getFullYear()}`;
}

@Injectable()
export class FolhaPagamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly funcionarios: FuncionariosService,
  ) {}

  async listar(): Promise<CompetenciaFolha[]> {
    const processadas = await this.prisma.competenciaFolha.findMany({ orderBy: { criadoEm: 'desc' } });
    const competenciaDoMes = competenciaAtual();
    const jaProcessadaEsteMes = processadas.some((c) => c.competencia === competenciaDoMes);

    const historico: CompetenciaFolha[] = processadas.map((c) => ({
      id: c.id,
      competencia: c.competencia,
      totalFuncionarios: c.totalFuncionarios,
      proventos: c.proventos?.toNumber() ?? null,
      descontos: c.descontos?.toNumber() ?? null,
      liquido: c.liquido?.toNumber() ?? null,
      status: c.status as StatusFolha,
    }));

    if (jaProcessadaEsteMes) {
      return historico;
    }

    const estimativa = await this.calcularCompetenciaAtual();
    return [estimativa, ...historico];
  }

  async processar(): Promise<CompetenciaFolha> {
    const competencia = competenciaAtual();
    const existente = await this.prisma.competenciaFolha.findFirst({ where: { competencia } });
    if (existente) {
      return {
        id: existente.id,
        competencia: existente.competencia,
        totalFuncionarios: existente.totalFuncionarios,
        proventos: existente.proventos?.toNumber() ?? null,
        descontos: existente.descontos?.toNumber() ?? null,
        liquido: existente.liquido?.toNumber() ?? null,
        status: existente.status as StatusFolha,
      };
    }

    const estimativa = await this.calcularCompetenciaAtual();
    const criada = await this.prisma.competenciaFolha.create({
      data: {
        competencia,
        totalFuncionarios: estimativa.totalFuncionarios,
        proventos: estimativa.proventos,
        descontos: estimativa.descontos,
        liquido: estimativa.liquido,
        status: 'processada',
      },
    });

    return {
      id: criada.id,
      competencia: criada.competencia,
      totalFuncionarios: criada.totalFuncionarios,
      proventos: criada.proventos?.toNumber() ?? null,
      descontos: criada.descontos?.toNumber() ?? null,
      liquido: criada.liquido?.toNumber() ?? null,
      status: criada.status as StatusFolha,
    };
  }

  private async calcularCompetenciaAtual(): Promise<CompetenciaFolha> {
    const todos = await this.funcionarios.listar();
    const ativos = todos.filter((f) => f.status === 'ativo');
    const proventos = ativos.reduce((soma, f) => soma + f.salarioBase, 0);

    return {
      id: null,
      competencia: competenciaAtual(),
      totalFuncionarios: ativos.length,
      proventos,
      descontos: null,
      liquido: proventos,
      status: 'em_aberto',
    };
  }
}
