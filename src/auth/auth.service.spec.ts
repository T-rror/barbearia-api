import { describe, expect, it, jest } from '@jest/globals';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('always assigns the client role during public signup', async () => {
    const prisma = {
      user: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue(null),
        create: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({
            id: 'user-id',
            name: 'Client',
            email: 'client@example.com',
            phone: '11999999999',
            role: Role.CLIENTE,
          }),
      },
    };
    const jwt = { signAsync: jest.fn() };
    const service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
    );

    const signupPayload = {
      name: 'Client',
      email: 'client@example.com',
      phone: '11999999999',
      password: 'a-strong-password',
      role: Role.ADMIN,
    };
    await service.signup(signupPayload);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: Role.CLIENTE }),
      }),
    );
  });
});
