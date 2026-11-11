import { describe, expect, it, jest } from '@jest/globals';
import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Role, Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService authorization', () => {
  it('does not let a client create a payment for another client appointment', async () => {
    const prisma = {
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({
            id: 'appointment-id',
            userId: 'owner-id',
            payments: [],
          }),
      },
      payment: { create: jest.fn<(...args: any[]) => unknown>() },
    };
    const service = new PaymentsService(prisma as unknown as PrismaService);

    await expect(
      service.create(
        {
          appointmentId: 'appointment-id',
          method: PaymentMethod.PIX,
          amount: 50,
        },
        'other-user-id',
        Role.CLIENTE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('does not let a client read payments for another client appointment', async () => {
    const prisma = {
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ userId: 'owner-id' }),
      },
      payment: { findMany: jest.fn<(...args: any[]) => unknown>() },
    };
    const service = new PaymentsService(prisma as unknown as PrismaService);

    await expect(
      service.findByAppointment(
        'appointment-id',
        'other-user-id',
        Role.CLIENTE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.payment.findMany).not.toHaveBeenCalled();
  });

  it('does not create a second active payment for an appointment', async () => {
    const previousPrices = process.env.SERVICE_PRICES;
    process.env.SERVICE_PRICES = JSON.stringify({ Haircut: 50 });
    const transaction = {
      $queryRaw: jest
        .fn<(...args: any[]) => Promise<unknown[]>>()
        .mockResolvedValue([]),
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ status: Status.PENDENTE }),
      },
      payment: {
        findFirst: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ id: 'existing-payment' }),
        create: jest.fn<(...args: any[]) => unknown>(),
      },
    };
    const prisma = {
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({
            id: 'appointment-id',
            userId: 'owner-id',
            status: Status.PENDENTE,
            service: 'Haircut',
          }),
      },
      $transaction: jest
        .fn<(...args: any[]) => Promise<unknown>>()
        .mockImplementation(
          (operation: (tx: typeof transaction) => Promise<unknown>) =>
            operation(transaction),
        ),
    };
    const service = new PaymentsService(prisma as unknown as PrismaService);

    try {
      await expect(
        service.create(
          {
            appointmentId: 'appointment-id',
            method: PaymentMethod.PIX,
            amount: 50,
          },
          'owner-id',
          Role.CLIENTE,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            appointmentId: 'appointment-id',
            status: { in: [PaymentStatus.PENDENTE, PaymentStatus.PAGO] },
          },
        }),
      );
    } finally {
      if (previousPrices === undefined) delete process.env.SERVICE_PRICES;
      else process.env.SERVICE_PRICES = previousPrices;
    }
  });

  it('uses the establishment price instead of the client supplied amount', async () => {
    const previousPrices = process.env.SERVICE_PRICES;
    process.env.SERVICE_PRICES = JSON.stringify({ Haircut: 42.5 });
    const payment = { id: 'payment-id', amount: 42.5 };
    const transaction = {
      $queryRaw: jest
        .fn<(...args: any[]) => Promise<unknown[]>>()
        .mockResolvedValue([]),
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({ status: Status.PENDENTE }),
      },
      payment: {
        findFirst: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue(null),
        create: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue(payment),
      },
    };
    const prisma = {
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({
            id: 'appointment-id',
            userId: 'owner-id',
            status: Status.PENDENTE,
            service: 'Haircut',
          }),
      },
      $transaction: jest
        .fn<(...args: any[]) => Promise<unknown>>()
        .mockImplementation(
          (operation: (tx: typeof transaction) => Promise<unknown>) =>
            operation(transaction),
        ),
    };
    const service = new PaymentsService(prisma as unknown as PrismaService);

    try {
      await expect(
        service.create(
          {
            appointmentId: 'appointment-id',
            method: PaymentMethod.PIX,
            amount: 1,
          },
          'owner-id',
          Role.CLIENTE,
        ),
      ).resolves.toEqual(payment);
      expect(transaction.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 42.5 }),
        }),
      );
    } finally {
      if (previousPrices === undefined) delete process.env.SERVICE_PRICES;
      else process.env.SERVICE_PRICES = previousPrices;
    }
  });

  it('rejects payment when the establishment has no price for the service', async () => {
    const previousPrices = process.env.SERVICE_PRICES;
    process.env.SERVICE_PRICES = '{}';
    const prisma = {
      appointment: {
        findUnique: jest
          .fn<(...args: any[]) => Promise<unknown>>()
          .mockResolvedValue({
            id: 'appointment-id',
            userId: 'owner-id',
            status: Status.PENDENTE,
            service: 'Haircut',
          }),
      },
      $transaction: jest.fn(),
    };
    const service = new PaymentsService(prisma as unknown as PrismaService);

    try {
      await expect(
        service.create(
          {
            appointmentId: 'appointment-id',
            method: PaymentMethod.PIX,
            amount: 50,
          },
          'owner-id',
          Role.CLIENTE,
        ),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    } finally {
      if (previousPrices === undefined) delete process.env.SERVICE_PRICES;
      else process.env.SERVICE_PRICES = previousPrices;
    }
  });
});
