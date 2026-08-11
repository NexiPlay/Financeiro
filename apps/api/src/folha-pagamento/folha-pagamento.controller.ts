import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { FolhaPagamentoService } from './folha-pagamento.service';

@Controller('folha-pagamento')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin', 'rh')
export class FolhaPagamentoController {
  constructor(private readonly service: FolhaPagamentoService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Post('processar')
  processar() {
    return this.service.processar();
  }
}
