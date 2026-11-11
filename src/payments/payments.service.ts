import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dtos/create-payments.dtos';
import { PaymentStatus, Status } from '@prisma/client';
import { Role } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, userId: string, role: Role) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      select: { id: true, userId: true, status: true, service: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    if (role !== Role.ADMIN && appointment.userId !== userId) {
      throw new ForbiddenException('Sem permissão para pagar este agendamento');
    }
    if (appointment.status !== Status.PENDENTE) {
      throw new BadRequestException(
        'Só é possível pagar agendamentos pendentes',
      );
    }
    if (dto.method === 'CRYPTO' && !dto.txHash) {
      throw new BadRequestException(
        'txHash é obrigatório para pagamentos CRYPTO',
      );
    }
    if (dto.method !== 'CRYPTO' && dto.txHash) {
      throw new BadRequestException(
        'txHash só pode ser informado para pagamentos CRYPTO',
      );
    }
    const amount = this.getConfiguredPrice(appointment.service);

    return this.prisma.$transaction(async (transaction) => {
      const lockKey = `payment:${dto.appointmentId}`;
      await transaction.$queryRaw`WITH advisory_lock AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext(${lockKey}))) SELECT TRUE AS locked FROM advisory_lock`;
      await transaction.$queryRaw`SELECT "id" FROM "Appointment" WHERE "id" = ${dto.appointmentId}::uuid FOR UPDATE`;
      const currentAppointment = await transaction.appointment.findUnique({
        where: { id: dto.appointmentId },
        select: { status: true },
      });
      if (currentAppointment?.status !== Status.PENDENTE) {
        throw new BadRequestException(
          'Só é possível pagar agendamentos pendentes',
        );
      }
      const activePayment = await transaction.payment.findFirst({
        where: {
          appointmentId: dto.appointmentId,
          status: { in: [PaymentStatus.PENDENTE, PaymentStatus.PAGO] },
        },
        select: { id: true },
      });
      if (activePayment) {
        throw new BadRequestException(
          'Este agendamento já possui um pagamento pendente ou confirmado',
        );
      }
      return transaction.payment.create({
        data: {
          appointmentId: dto.appointmentId,
          method: dto.method,
          amount,
          txHash: dto.txHash,
        },
      });
    });
  }

  async confirmPayment(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { appointment: { select: { status: true } } },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status === PaymentStatus.PAGO) {
      throw new BadRequestException('Pagamento já confirmado');
    }
    if (payment.status !== PaymentStatus.PENDENTE) {
      throw new BadRequestException(
        'Somente pagamentos pendentes podem ser confirmados',
      );
    }
    if (payment.appointment.status !== Status.PENDENTE) {
      throw new BadRequestException(
        'O agendamento não está pendente e o pagamento não pode ser confirmado',
      );
    }

    // 🔐 Transação para garantir consistência
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAGO,
          confirmedById: adminId,
          confirmedAt: new Date(),
        },
      }),
      this.prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          status: Status.CONCLUIDO,
          concludedAt: new Date(),
        },
      }),
    ]);

    return { message: 'Pagamento confirmado com sucesso' };
  }

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        appointmentId: true,
        method: true,
        status: true,
        amount: true,
        confirmedAt: true,
        createdAt: true,
        appointment: {
          select: { name: true, service: true, date: true, time: true },
        },
      },
    });
  }

  async findByAppointment(appointmentId: string, userId: string, role: Role) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { userId: true },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (role !== Role.ADMIN && appointment.userId !== userId) {
      throw new ForbiddenException(
        'Sem permissão para consultar estes pagamentos',
      );
    }
    return this.prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        appointmentId: true,
        method: true,
        status: true,
        amount: true,
        confirmedAt: true,
        txHash: true,
        createdAt: true,
      },
    });
  }

  private getConfiguredPrice(serviceName: string): number {
    let prices: unknown;
    try {
      prices = JSON.parse(process.env.SERVICE_PRICES ?? '{}');
    } catch {
      throw new ServiceUnavailableException(
        'A configuração SERVICE_PRICES não contém JSON válido',
      );
    }

    if (!prices || typeof prices !== 'object' || Array.isArray(prices)) {
      throw new ServiceUnavailableException(
        'A configuração SERVICE_PRICES deve ser um objeto JSON',
      );
    }

    const price = (prices as Record<string, unknown>)[serviceName];
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      throw new ServiceUnavailableException(
        `Não há preço positivo configurado para o serviço "${serviceName}"`,
      );
    }
    return price;
  }
}
