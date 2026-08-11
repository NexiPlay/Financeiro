-- AlterTable
ALTER TABLE "contas_pagar" ADD COLUMN     "parcelaAtual" INTEGER,
ADD COLUMN     "totalParcelas" INTEGER;

-- AlterTable
ALTER TABLE "contas_receber" ADD COLUMN     "parcelaAtual" INTEGER,
ADD COLUMN     "totalParcelas" INTEGER;
