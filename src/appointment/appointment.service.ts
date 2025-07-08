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
    return this.prisma.appointment.create({
      data: {
        ...dto,
        date: new Date(dto.date), // garante formato DateTime
        userId,
      },
    });
  }
}
