import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  it('returns pending appointments for a date without exposing user data', async () => {
    const expected = [{ id: 'appointment-id', time: '10:00' }];
    const prisma = {
      appointment: {
        findMany: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue(expected),
      },
    };
    const service = new AppointmentService(prisma as unknown as PrismaService);

    await expect(service.findByDate('2026-11-12')).resolves.toEqual(expected);
    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDENTE' }),
        select: expect.not.objectContaining({ user: expect.anything() }),
      }),
    );
  });

  it('rejects a second pending appointment in an occupied time slot', async () => {
    const transaction = {
      $queryRaw: jest
        .fn<(...args: any[]) => Promise<unknown[]>>()
        .mockResolvedValue([]),
      appointment: {
        findFirst: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ id: 'existing-id' }),
        create: jest.fn<(...args: any[]) => unknown>(),
      },
    };
    const prisma = {
      user: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ name: 'Client', phone: '11999999999' }),
      },
      $transaction: jest
        .fn<(...args: any[]) => Promise<unknown>>()
        .mockImplementation(
          (operation: (tx: typeof transaction) => Promise<unknown>) =>
            operation(transaction),
        ),
    };
    const service = new AppointmentService(prisma as unknown as PrismaService);

    await expect(
      service.create(
        { date: '2026-11-12', time: '10:00', service: 'Haircut' },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.appointment.create).not.toHaveBeenCalled();
  });
});
