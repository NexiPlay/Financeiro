import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AuditoriaController {
  constructor(private readonly service: AuditoriaService) {}

  @Get()
  @Roles('admin')
  listar() {
    return this.service.listar();
  }
}
