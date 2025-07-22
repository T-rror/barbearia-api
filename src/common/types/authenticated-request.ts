// src/common/types/authenticated-request.ts (ou onde preferir)
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role?: string;
    // outros campos que você decodifica no JWT
  };
}
