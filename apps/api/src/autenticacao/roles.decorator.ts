import { SetMetadata } from '@nestjs/common';
import type { Papel } from './papel';

export const PAPEIS_PERMITIDOS_KEY = 'papeisPermitidos';

export const Roles = (...papeis: Papel[]) => SetMetadata(PAPEIS_PERMITIDOS_KEY, papeis);
