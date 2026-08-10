import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(SupabaseAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('indicadores')
  indicadores() {
    return this.service.indicadores();
  }
}
