import { Module } from '@nestjs/common';
import { FolhaPagamentoController } from './folha-pagamento.controller';
import { FolhaPagamentoService } from './folha-pagamento.service';

@Module({
  controllers: [FolhaPagamentoController],
  providers: [FolhaPagamentoService],
  exports: [FolhaPagamentoService],
})
export class FolhaPagamentoModule {}
