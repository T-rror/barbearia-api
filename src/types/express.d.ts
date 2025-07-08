// src/types/express.d.ts
import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      // aqui você pode adicionar outros campos que o token JWT tiver
    };
  }
}
