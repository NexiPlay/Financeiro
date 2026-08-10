import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FluxoCaixaModule } from '../fluxo-caixa/fluxo-caixa.module';
import { ContasPagarModule } from '../contas-pagar/contas-pagar.module';
import { ContasReceberModule } from '../contas-receber/contas-receber.module';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';
import { FolhaPagamentoModule } from '../folha-pagamento/folha-pagamento.module';

@Module({
  imports: [FluxoCaixaModule, ContasPagarModule, ContasReceberModule, FuncionariosModule, FolhaPagamentoModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
