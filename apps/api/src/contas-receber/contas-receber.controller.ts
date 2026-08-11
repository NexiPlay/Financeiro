import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { CriarContaReceberInput, ContasReceberService } from './contas-receber.service';

@Controller('contas-receber')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ContasReceberController {
  constructor(private readonly service: ContasReceberService) {}

  @Get()
  @Roles('admin', 'financeiro')
  listar() {
    return this.service.listar();
  }

  @Post()
  @Roles('admin', 'financeiro')
  criar(@Body() dados: CriarContaReceberInput) {
    if (!dados.cliente || !dados.descricao || !dados.vencimento || !dados.status) {
      throw new BadRequestException('Preencha todos os campos obrigatórios.');
    }
    if (typeof dados.valor !== 'number' || dados.valor < 0) {
      throw new BadRequestException('Valor inválido.');
    }
    return this.service.criar(dados);
  }
}
