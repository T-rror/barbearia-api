import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dtos/appointment';

@Injectable()
export class AppointmentService {
    constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: { date: 'asc' },
      include: {user: true},
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
    },
    include: {
      user: true,
    },
  });
}
}