import { Injectable } from '@nestjs/common';
import { FluxoCaixaService } from '../fluxo-caixa/fluxo-caixa.service';
import { ContasPagarService } from '../contas-pagar/contas-pagar.service';
import { ContasReceberService } from '../contas-receber/contas-receber.service';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { FolhaPagamentoService } from '../folha-pagamento/folha-pagamento.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly fluxoCaixa: FluxoCaixaService,
    private readonly contasPagar: ContasPagarService,
    private readonly contasReceber: ContasReceberService,
    private readonly funcionarios: FuncionariosService,
    private readonly folhaPagamento: FolhaPagamentoService,
  ) {}

  async indicadores() {
    const [contasPagar, contasReceber, resumoCaixa, funcionarios, competencias] = await Promise.all([
      this.contasPagar.listar(),
      this.contasReceber.listar(),
      this.fluxoCaixa.resumo(),
      this.funcionarios.listar(),
      this.folhaPagamento.listar(),
    ]);

    const aPagar = contasPagar.filter((c) => c.status !== 'pago');
    const aReceber = contasReceber.filter((c) => c.status !== 'recebido');
    const ultimaProcessada = competencias.find((c) => c.status === 'processada');

    return {
      saldoEmCaixa: resumoCaixa.saldoEmCaixa,
      aPagar: { total: aPagar.reduce((soma, c) => soma + c.valor, 0), quantidade: aPagar.length },
      aReceber: { total: aReceber.reduce((soma, c) => soma + c.valor, 0), quantidade: aReceber.length },
      folhaDoMes: {
        total: ultimaProcessada?.liquido ?? 0,
        funcionarios: funcionarios.filter((f) => f.status === 'ativo').length,
      },
    };
  }
}
