import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentAdminDto,
  CreateAppointmentDto,
} from './dtos/appointment';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      select: {
        id: true,
        name: true,
        phone: true,
        date: true,
        time: true,
        service: true,
        status: true,
        createdAt: true,
        concludedAt: true,
        cancelAt: true,
        userId: true,
        createdByAdmin: true,
      },
    });
  }

  async findByDate(date: string) {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    const start = new Date(parsedDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return this.prisma.appointment.findMany({
      where: { date: { gte: start, lt: end }, status: 'PENDENTE' },
      orderBy: { time: 'asc' },
      select: { id: true, date: true, time: true, service: true, status: true },
    });
  }

  async create(dto: CreateAppointmentDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.createInAvailableSlot(dto.date, dto.time, (transaction) =>
      transaction.appointment.create({
        data: {
          name: user.name,
          phone: user.phone,
          date: new Date(dto.date),
          time: dto.time,
          service: dto.service,
          userId,
          status: 'PENDENTE',
        },
        select: {
          id: true,
          name: true,
          phone: true,
          date: true,
          time: true,
          service: true,
          status: true,
          createdAt: true,
          userId: true,
          createdByAdmin: true,
        },
      }),
    );
  }

  async createByAdmin(dto: CreateAppointmentAdminDto) {
    return this.createInAvailableSlot(dto.date, dto.time, (transaction) =>
      transaction.appointment.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          date: new Date(dto.date),
          time: dto.time,
          service: dto.service,
          createdByAdmin: true,
          status: 'PENDENTE',
        },
      }),
    );
  }

  private async createInAvailableSlot<T>(
    date: string,
    time: string,
    create: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    const start = new Date(parsedDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const slotKey = `appointment:${start.toISOString().slice(0, 10)}:${time}`;
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`WITH advisory_lock AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext(${slotKey}))) SELECT TRUE AS locked FROM advisory_lock`;
      const conflict = await transaction.appointment.findFirst({
        where: {
          date: { gte: start, lt: end },
          time,
          status: 'PENDENTE',
        },
        select: { id: true },
      });
      if (conflict) {
        throw new BadRequestException('Este horário já está reservado');
      }
      return create(transaction);
    });
  }

  async marcarComoConcluido(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.status !== 'PENDENTE') {
      throw new BadRequestException(
        'Somente agendamentos pendentes podem ser concluídos',
      );
    }
    return this.prisma.appointment.update({
      where: { id },
      data: {
        concludedAt: new Date(),
        status: 'CONCLUIDO',
      },
    });
  }

  async cancelarAgendamento(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.status !== 'PENDENTE') {
      throw new BadRequestException(
        'Somente agendamentos pendentes podem ser cancelados',
      );
    }
    return this.prisma.appointment.update({
      where: { id },
      data: {
        cancelAt: new Date(),
        status: 'CANCELADO',
      },
    });
  }

  async findConcluidos() {
    return this.prisma.appointment.findMany({
      where: { status: 'CONCLUIDO' },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        date: true,
        time: true,
        service: true,
        status: true,
        createdAt: true,
        concludedAt: true,
        userId: true,
      },
    });
  }

  async findCancelados() {
    return this.prisma.appointment.findMany({
      where: { status: 'CANCELADO' },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        date: true,
        time: true,
        service: true,
        status: true,
        createdAt: true,
        cancelAt: true,
        userId: true,
      },
    });
  }
}
