import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dtos/create-payments.dtos';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { payments: true },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado');
    }

    const alreadyPaid = appointment.payments.some(
      (p) => p.status === 'PAGO',
    );

    if (alreadyPaid) {
      throw new BadRequestException(
        'Este agendamento já possui um pagamento confirmado',
      );
    }

    return this.prisma.payment.create({
      data: {
        appointmentId: dto.appointmentId,
        method: dto.method,
        amount: dto.amount,
        txHash: dto.txHash,
      },
    });
  }

  async confirmPayment(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { appointment: true },
    });

    if (!payment) {
      throw new BadRequestException('Pagamento não encontrado');
    }

    if (payment.status === 'PAGO') {
      throw new BadRequestException('Pagamento já confirmado');
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAGO',
        confirmedById: adminId,
        confirmedAt: new Date(),
      },
    });

    await this.prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: {
        status: 'CONCLUIDO',
        concludedAt: new Date(),
      },
    });

    return { message: 'Pagamento confirmado com sucesso' };
  }

  async findByAppointment(appointmentId: string) {
    return this.prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
