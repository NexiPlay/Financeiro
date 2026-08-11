import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { CriarContaPagarInput, ContasPagarService } from './contas-pagar.service';

@Controller('contas-pagar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ContasPagarController {
  constructor(private readonly service: ContasPagarService) {}

  @Get()
  @Roles('admin', 'financeiro')
  listar() {
    return this.service.listar();
  }

  @Post()
  @Roles('admin', 'financeiro')
  criar(@Body() dados: CriarContaPagarInput) {
    this.validar(dados);
    return this.service.criar(dados);
  }

  @Patch(':id')
  @Roles('admin', 'financeiro')
  atualizar(@Param('id') id: string, @Body() dados: CriarContaPagarInput) {
    this.validar(dados);
    return this.service.atualizar(id, dados);
  }

  private validar(dados: CriarContaPagarInput) {
    if (!dados.fornecedor || !dados.descricao || !dados.vencimento || !dados.status) {
      throw new BadRequestException('Preencha todos os campos obrigatórios.');
    }
    if (typeof dados.valor !== 'number' || dados.valor < 0) {
      throw new BadRequestException('Valor inválido.');
    }
  }
}
