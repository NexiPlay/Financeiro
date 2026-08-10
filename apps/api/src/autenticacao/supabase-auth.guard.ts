import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import type { UsuarioAutenticado, Papel } from './papel';

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Token de acesso ausente.');
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const usuario: UsuarioAutenticado = {
      id: data.user.id,
      email: data.user.email ?? '',
      papel: (data.user.app_metadata?.papel ?? 'financeiro') as Papel,
    };
    request.usuario = usuario;
    return true;
  }
}
