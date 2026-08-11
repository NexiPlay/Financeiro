import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { CriarMovimentacaoInput, FluxoCaixaService } from './fluxo-caixa.service';
import { VALOR_MAXIMO_CONTA } from '../comum/limites';

@Controller('fluxo-caixa')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'financeiro')
export class FluxoCaixaController {
  constructor(private readonly service: FluxoCaixaService) {}

  @Get('movimentacoes')
  listarMovimentacoes() {
    return this.service.listarMovimentacoes();
  }

  @Post('movimentacoes')
  criar(@Body() dados: CriarMovimentacaoInput) {
    if (!dados.data || !dados.descricao || !dados.tipo) {
      throw new BadRequestException('Preencha todos os campos obrigatórios.');
    }
    if (dados.tipo !== 'entrada' && dados.tipo !== 'saida') {
      throw new BadRequestException('Tipo inválido.');
    }
    if (typeof dados.valor !== 'number' || dados.valor <= 0) {
      throw new BadRequestException('Valor inválido.');
    }
    if (dados.valor > VALOR_MAXIMO_CONTA) {
      throw new BadRequestException(`Valor acima do limite permitido (${VALOR_MAXIMO_CONTA.toLocaleString('pt-BR')}).`);
    }
    return this.service.criar(dados);
  }

  @Get('resumo')
  resumo() {
    return this.service.resumo();
  }
}
