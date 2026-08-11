import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../autenticacao/supabase-auth.guard';
import { RolesGuard } from '../autenticacao/roles.guard';
import { Roles } from '../autenticacao/roles.decorator';
import type { Papel, UsuarioAutenticado } from '../autenticacao/papel';
import { CriarUsuarioInput, UsuariosService } from './usuarios.service';

const PAPEIS_VALIDOS: Papel[] = ['admin', 'financeiro', 'rh'];

@Controller('usuarios')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Post()
  criar(@Body() dados: CriarUsuarioInput) {
    if (!dados.email || !dados.senha || !dados.papel) {
      throw new BadRequestException('Preencha todos os campos obrigatórios.');
    }
    if (dados.senha.length < 8) {
      throw new BadRequestException('A senha precisa ter ao menos 8 caracteres.');
    }
    if (!PAPEIS_VALIDOS.includes(dados.papel)) {
      throw new BadRequestException('Papel inválido.');
    }
    return this.service.criar(dados);
  }

  @Patch(':id/papel')
  atualizarPapel(@Param('id') id: string, @Body('papel') papel: Papel, @Req() req: { usuario: UsuarioAutenticado }) {
    if (!PAPEIS_VALIDOS.includes(papel)) {
      throw new BadRequestException('Papel inválido.');
    }
    if (req.usuario.id === id && papel !== 'admin') {
      throw new ForbiddenException('Você não pode remover o seu próprio papel de admin.');
    }
    return this.service.atualizarPapel(id, papel);
  }
}
