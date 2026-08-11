import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Papel } from '../autenticacao/papel';

export interface Usuario {
  id: string;
  email: string;
  papel: Papel;
  criadoEm: string;
}

export interface CriarUsuarioInput {
  email: string;
  senha: string;
  papel: Papel;
}

@Injectable()
export class UsuariosService {
  private clienteAdmin: SupabaseClient | null = null;

  private admin(): SupabaseClient {
    if (!this.clienteAdmin) {
      const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!chave) {
        throw new InternalServerErrorException(
          'SUPABASE_SERVICE_ROLE_KEY não configurada no backend — pegue a service_role key em Settings > API no painel do Supabase e adicione ao apps/api/.env.',
        );
      }
      this.clienteAdmin = createClient(process.env.SUPABASE_URL ?? '', chave);
    }
    return this.clienteAdmin;
  }

  async listar(): Promise<Usuario[]> {
    const { data, error } = await this.admin().auth.admin.listUsers();
    if (error) throw new InternalServerErrorException(error.message);
    return data.users.map((u) => this.mapear(u)).sort((a, b) => a.email.localeCompare(b.email));
  }

  async criar(dados: CriarUsuarioInput): Promise<Usuario> {
    const { data, error } = await this.admin().auth.admin.createUser({
      email: dados.email,
      password: dados.senha,
      email_confirm: true,
      app_metadata: { papel: dados.papel },
    });
    if (error) throw new InternalServerErrorException(error.message);
    return this.mapear(data.user);
  }

  async atualizarPapel(id: string, papel: Papel): Promise<Usuario> {
    const admin = this.admin();
    const { data: atual, error: erroBusca } = await admin.auth.admin.getUserById(id);
    if (erroBusca || !atual.user) throw new NotFoundException('Usuário não encontrado.');

    const { data, error } = await admin.auth.admin.updateUserById(id, {
      app_metadata: { ...atual.user.app_metadata, papel },
    });
    if (error) throw new InternalServerErrorException(error.message);
    return this.mapear(data.user);
  }

  private mapear(u: { id: string; email?: string; app_metadata?: Record<string, unknown>; created_at: string }): Usuario {
    return {
      id: u.id,
      email: u.email ?? '',
      papel: (u.app_metadata?.papel ?? 'financeiro') as Papel,
      criadoEm: u.created_at,
    };
  }
}
