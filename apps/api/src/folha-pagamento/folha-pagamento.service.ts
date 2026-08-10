import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatusFolha = 'em_aberto' | 'processada';

export interface CompetenciaFolha {
  id: string;
  competencia: string;
  totalFuncionarios: number;
  proventos: number | null;
  descontos: number | null;
  liquido: number | null;
  status: StatusFolha;
}

@Injectable()
export class FolhaPagamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<CompetenciaFolha[]> {
    const competencias = await this.prisma.competenciaFolha.findMany({ orderBy: { criadoEm: 'desc' } });
    return competencias.map((c) => ({
      id: c.id,
      competencia: c.competencia,
      totalFuncionarios: c.totalFuncionarios,
      proventos: c.proventos?.toNumber() ?? null,
      descontos: c.descontos?.toNumber() ?? null,
      liquido: c.liquido?.toNumber() ?? null,
      status: c.status as StatusFolha,
    }));
  }
}
