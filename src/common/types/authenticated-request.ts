// src/common/types/authenticated-request.ts (ou onde preferir)
import { Request } from 'express';
import { AuthUser } from '../../auth/types/auth-user.type';

export type AuthenticatedRequest = Request & { user: AuthUser };
