import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { ContasPagarService } from './contas-pagar.service';

@Controller('contas-pagar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ContasPagarController {
  constructor(private readonly service: ContasPagarService) {}

  @Get()
  @Roles('admin', 'financeiro')
  listar() {
    return this.service.listar();
  }
}
