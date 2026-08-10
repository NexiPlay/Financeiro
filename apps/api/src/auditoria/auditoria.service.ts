import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  modulo: string;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<LogAuditoria[]> {
    const registros = await this.prisma.logAuditoria.findMany({ orderBy: { dataHora: 'desc' } });
    return registros.map((r) => ({
      id: r.id,
      dataHora: r.dataHora.toISOString(),
      usuario: r.usuario,
      acao: r.acao,
      modulo: r.modulo,
    }));
  }

  async registrar(entrada: Omit<LogAuditoria, 'id' | 'dataHora'>): Promise<LogAuditoria> {
    const registro = await this.prisma.logAuditoria.create({ data: entrada });
    return {
      id: registro.id,
      dataHora: registro.dataHora.toISOString(),
      usuario: registro.usuario,
      acao: registro.acao,
      modulo: registro.modulo,
    };
  }
}
