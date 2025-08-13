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

    // Agora o return está dentro do escopo da função
    return this.prisma.appointment.create({
      data: {
        name: user.name,
        phone: user.phone,
        date: new Date(dto.date),
        time: dto.time,
        service: dto.service,
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async marcarComoConcluido(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { concluido: true,
        concludedAt: new Date()
       },
    });
  }

  async findConcluidos() {
  return this.prisma.appointment.findMany({
    where: {
      concluido: true,
    },
    orderBy: { date: 'desc' },
    include: { user: true },
  });
}

async createByAdmin(dto: CreateAppointmentAdminDto) {
  // aqui o admin cria agendamento pra qualquer cliente
  console.log('Recebido no backend:', dto);

  return this.prisma.appointment.create({
    data: {
      name: dto.name,
      phone: dto.phone,
      date: new Date(dto.date),
      time: dto.time,
      service: dto.service,
      createdByAdmin: true
    }
  });
}
async cancelarAgendamento(id: string) {
  return this.prisma.appointment.update(
    {
      where: {id},
      data: { status: 'CANCELADO' },

    });
 
}

async findCancelados() {
  return this.prisma.appointment.findMany({
    where: { status: 'CANCELADO' },
  });
}

}
