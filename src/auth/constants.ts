const secret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
}

export const jwtConstants = { secret: secret ?? '' };
