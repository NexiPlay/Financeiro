import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { ContasReceberService } from './contas-receber.service';

@Controller('contas-receber')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ContasReceberController {
  constructor(private readonly service: ContasReceberService) {}

  @Get()
  @Roles('admin', 'financeiro')
  listar() {
    return this.service.listar();
  }
}
