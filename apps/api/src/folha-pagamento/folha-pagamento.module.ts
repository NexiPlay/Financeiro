import { Module } from '@nestjs/common';
import { FolhaPagamentoController } from './folha-pagamento.controller';
import { FolhaPagamentoService } from './folha-pagamento.service';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';

@Module({
  imports: [FuncionariosModule],
  controllers: [FolhaPagamentoController],
  providers: [FolhaPagamentoService],
  exports: [FolhaPagamentoService],
})
export class FolhaPagamentoModule {}
