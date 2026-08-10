import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { FolhaPagamentoService } from './folha-pagamento.service';

@Controller('folha-pagamento')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class FolhaPagamentoController {
  constructor(private readonly service: FolhaPagamentoService) {}

  @Get()
  @Roles('admin', 'rh')
  listar() {
    return this.service.listar();
  }
}
