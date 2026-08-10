import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PAPEIS_PERMITIDOS_KEY } from './roles.decorator';
import type { Papel, UsuarioAutenticado } from './papel';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const papeisPermitidos = this.reflector.getAllAndOverride<Papel[]>(PAPEIS_PERMITIDOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!papeisPermitidos || papeisPermitidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario: UsuarioAutenticado | undefined = request.usuario;

    if (!usuario || !papeisPermitidos.includes(usuario.papel)) {
      throw new ForbiddenException('Você não tem papel suficiente para esta ação.');
    }

    return true;
  }
}
