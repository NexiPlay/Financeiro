import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.contaPagar.createMany({
    data: [
      { fornecedor: 'Distribuidora Alfa Ltda', descricao: 'Fornecimento de materiais', vencimento: new Date('2026-08-12'), valor: 8450, status: 'pendente' },
      { fornecedor: 'Consultoria BR Tech', descricao: 'Serviços de TI', vencimento: new Date('2026-08-09'), valor: 15200, status: 'atrasado' },
      { fornecedor: 'Imobiliária Cortez', descricao: 'Aluguel — sede', vencimento: new Date('2026-08-05'), valor: 6800, status: 'pago' },
      { fornecedor: 'Gráfica Nexus', descricao: 'Material impresso', vencimento: new Date('2026-08-18'), valor: 1230, status: 'pendente' },
      { fornecedor: 'Energéticas S.A.', descricao: 'Conta de energia', vencimento: new Date('2026-08-20'), valor: 3410, status: 'pendente' },
    ],
  });

  await prisma.contaReceber.createMany({
    data: [
      { cliente: 'Vega Corp Distribuição', descricao: 'Prestação de serviço mensal', vencimento: new Date('2026-08-10'), valor: 18400, status: 'pendente' },
      { cliente: 'Prisma Ltda', descricao: 'Consultoria financeira', vencimento: new Date('2026-08-08'), valor: 9750, status: 'recebido' },
      { cliente: 'Construtora Horizonte', descricao: 'Assessoria fiscal', vencimento: new Date('2026-08-04'), valor: 4100, status: 'atrasado' },
      { cliente: 'Comércio Delta', descricao: 'Licenciamento de sistema', vencimento: new Date('2026-08-20'), valor: 12300, status: 'pendente' },
      { cliente: 'Grupo Aurora', descricao: 'Serviço de folha terceirizada', vencimento: new Date('2026-08-22'), valor: 7600, status: 'pendente' },
    ],
  });

  await prisma.funcionario.createMany({
    data: [
      { nome: 'Felipe Souza', cargo: 'Analista Financeiro', departamento: 'Financeiro', admissao: new Date('2023-02-03'), salarioBase: 4800, status: 'ativo' },
      { nome: 'Ana Ribeiro', cargo: 'Coordenadora Financeira', departamento: 'Financeiro', admissao: new Date('2021-06-14'), salarioBase: 8200, status: 'ativo' },
      { nome: 'Marcos Vinícius', cargo: 'Assistente de RH', departamento: 'RH', admissao: new Date('2026-08-01'), salarioBase: 2950, status: 'ativo' },
      { nome: 'Rafael Lima', cargo: 'Gerente Administrativo', departamento: 'Administrativo', admissao: new Date('2019-11-22'), salarioBase: 9600, status: 'ativo' },
      { nome: 'Juliana Prado', cargo: 'Analista Contábil', departamento: 'Financeiro', admissao: new Date('2022-09-09'), salarioBase: 4500, status: 'afastado' },
    ],
  });

  await prisma.competenciaFolha.createMany({
    data: [
      { competencia: 'Agosto/2026', totalFuncionarios: 32, proventos: null, descontos: null, liquido: null, status: 'em_aberto' },
      { competencia: 'Julho/2026', totalFuncionarios: 32, proventos: 162300, descontos: 33900, liquido: 128400, status: 'processada' },
      { competencia: 'Junho/2026', totalFuncionarios: 31, proventos: 158900, descontos: 32700, liquido: 126200, status: 'processada' },
      { competencia: 'Maio/2026', totalFuncionarios: 31, proventos: 157100, descontos: 32100, liquido: 125000, status: 'processada' },
    ],
  });

  await prisma.movimentacaoCaixa.createMany({
    data: [
      { data: new Date('2026-07-26'), descricao: 'Recebimento — Vega Corp Distribuição', tipo: 'entrada', valor: 18400 },
      { data: new Date('2026-07-27'), descricao: 'Pagamento — Distribuidora Alfa Ltda', tipo: 'saida', valor: 6200 },
      { data: new Date('2026-07-28'), descricao: 'Recebimento — Prisma Ltda', tipo: 'entrada', valor: 9750 },
      { data: new Date('2026-07-29'), descricao: 'Folha de pagamento (adiantamento)', tipo: 'saida', valor: 22100 },
      { data: new Date('2026-07-30'), descricao: 'Recebimento — Vega Corp Distribuição', tipo: 'entrada', valor: 12300 },
    ],
  });

  await prisma.logAuditoria.createMany({
    data: [
      { dataHora: new Date('2026-08-07T14:32:00'), usuario: 'Felipe Souza', acao: 'Aprovou pagamento de Consultoria BR Tech', modulo: 'Contas a Pagar' },
      { dataHora: new Date('2026-08-07T13:47:00'), usuario: 'Ana Ribeiro', acao: 'Cadastrou o funcionário Marcos Vinícius', modulo: 'Funcionários' },
      { dataHora: new Date('2026-08-06T09:15:00'), usuario: 'Rafael Lima', acao: 'Alterou o papel de Felipe Souza para Financeiro', modulo: 'Controle de Acesso' },
      { dataHora: new Date('2026-08-05T18:02:00'), usuario: 'Sistema', acao: 'Gerou a folha de pagamento de julho/2026', modulo: 'Folha de Pagamento' },
      { dataHora: new Date('2026-08-01T08:05:00'), usuario: 'Sistema', acao: 'Login realizado', modulo: 'Autenticação' },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
