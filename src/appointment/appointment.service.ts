import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentAdminDto, CreateAppointmentDto } from './dtos/appointment';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    
    return this.prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      include: { user: true },
    });
  }

  async findByDate(date: string) {
    return this.prisma.appointment.findMany({
      where: { date: new Date(date) },
      orderBy: { time: 'asc' },
    });
  }

  async create(dto: CreateAppointmentDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return this.prisma.appointment.create({
      data: {
        name: user.name,
        phone: user.phone,
        date: new Date(dto.date),
        time: dto.time,
        service: dto.service,
        userId,
        status: 'PENDENTE', // 👈 padrão
      },
      include: { user: true },
    });
  }

  async createByAdmin(dto: CreateAppointmentAdminDto) {
    return this.prisma.appointment.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        date: new Date(dto.date),
        time: dto.time,
        service: dto.service,
        createdByAdmin: true,
        status: 'PENDENTE', // 👈 padrão
      },
    });
  }

  async marcarComoConcluido(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { 
        concludedAt: new Date(),
        status: 'CONCLUIDO',
      },
    });
  }

  async cancelarAgendamento(id: string) {
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
      include: { user: true },
    });
  }

  async findCancelados() {
    return this.prisma.appointment.findMany({
      where: { status: 'CANCELADO' },
      orderBy: { date: 'desc' },
      include: { user: true },
    });
  }
}
