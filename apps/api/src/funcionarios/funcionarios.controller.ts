import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import { CriarFuncionarioInput, FuncionariosService } from './funcionarios.service';

@Controller('funcionarios')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class FuncionariosController {
  constructor(private readonly service: FuncionariosService) {}

  @Get()
  @Roles('admin', 'rh')
  listar() {
    return this.service.listar();
  }

  @Post()
  @Roles('admin', 'rh')
  criar(@Body() dados: CriarFuncionarioInput) {
    this.validar(dados);
    return this.service.criar(dados);
  }

  @Patch(':id')
  @Roles('admin', 'rh')
  atualizar(@Param('id') id: string, @Body() dados: CriarFuncionarioInput) {
    this.validar(dados);
    return this.service.atualizar(id, dados);
  }

  private validar(dados: CriarFuncionarioInput) {
    if (!dados.nome || !dados.cargo || !dados.departamento || !dados.admissao || !dados.status) {
      throw new BadRequestException('Preencha todos os campos obrigatórios.');
    }
    if (typeof dados.salarioBase !== 'number' || dados.salarioBase < 0) {
      throw new BadRequestException('Salário base inválido.');
    }
  }
}
