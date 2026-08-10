import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContasPagarModule } from './contas-pagar/contas-pagar.module';
import { ContasReceberModule } from './contas-receber/contas-receber.module';
import { FluxoCaixaModule } from './fluxo-caixa/fluxo-caixa.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { FolhaPagamentoModule } from './folha-pagamento/folha-pagamento.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    DashboardModule,
    ContasPagarModule,
    ContasReceberModule,
    FluxoCaixaModule,
    FuncionariosModule,
    FolhaPagamentoModule,
    AuditoriaModule,
  ],
})
export class AppModule {}
