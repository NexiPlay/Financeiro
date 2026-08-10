export type Papel = 'admin' | 'financeiro' | 'rh';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  papel: Papel;
}
