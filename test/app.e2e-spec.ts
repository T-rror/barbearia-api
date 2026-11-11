import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it, jest, beforeAll, afterAll } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import request from 'supertest';
import { Server } from 'node:http';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API authorization and validation (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    appointment: {
      findMany: jest
        .fn<(...args: any[]) => Promise<unknown>>()
        .mockResolvedValue([
          {
            id: 'available-slot',
            date: new Date('2026-11-12T00:00:00.000Z'),
            time: '10:00',
            service: 'Haircut',
            status: 'PENDENTE',
          },
        ]),
    },
    payment: {},
  };

  const httpServer = () => app.getHttpServer() as Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated requests to protected routes', async () => {
    await request(httpServer()).get('/auth/me').expect(401);
  });

  it('rejects a public signup attempt that supplies an admin role', async () => {
    await request(httpServer())
      .post('/auth/signup')
      .send({
        name: 'Client',
        email: 'client@example.com',
        phone: '11999999999',
        password: 'strong-password',
        role: 'ADMIN',
      })
      .expect(400);
  });

  it('does not let a client change an appointment status', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ sub: 'client-id', role: Role.CLIENTE });

    await request(httpServer())
      .patch('/appointment/7ce9de23-a82a-4e09-93be-e323a6a40911/concluir')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('does not let a client confirm a payment', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ sub: 'client-id', role: Role.CLIENTE });

    await request(httpServer())
      .post('/payments/7ce9de23-a82a-4e09-93be-e323a6a40911/confirm')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('rejects non-positive payment values', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ sub: 'client-id', role: Role.CLIENTE });

    await request(httpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appointmentId: '7ce9de23-a82a-4e09-93be-e323a6a40911',
        method: 'PIX',
        amount: -1,
      })
      .expect(400);
  });

  it('rejects invalid appointment data before calling the service', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ sub: 'client-id', role: Role.CLIENTE });

    await request(httpServer())
      .post('/appointment')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 'not-a-date', time: '25:61', service: '' })
      .expect(400);
  });

  it('returns available appointments by date', async () => {
    const response = await request(httpServer())
      .get('/appointment/by-date/2026-11-12')
      .expect(200);

    const body = response.body as unknown as {
      appointments: Array<{ time: string }>;
    };
    expect(body.appointments).toHaveLength(1);
    expect(body.appointments[0].time).toBe('10:00');
  });
});
