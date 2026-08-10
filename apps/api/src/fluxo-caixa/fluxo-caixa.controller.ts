import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { FluxoCaixaService } from './fluxo-caixa.service';

@Controller('fluxo-caixa')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'financeiro')
export class FluxoCaixaController {
  constructor(private readonly service: FluxoCaixaService) {}

  @Get('movimentacoes')
  listarMovimentacoes() {
    return this.service.listarMovimentacoes();
  }

  @Get('resumo')
  resumo() {
    return this.service.resumo();
  }
}
