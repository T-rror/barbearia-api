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
  // Busca o usuário no banco de dados
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  // Verificação robusta do nome do usuário (null, undefined ou string vazia)
  const userNameIsEmpty = !user?.name || user.name.trim() === '';

  // Se o nome do usuário estiver em branco e o DTO tiver nome, atualiza o usuário
  if (user && userNameIsEmpty && dto.name) {
    console.log(`Atualizando nome do usuário (${user.id}) para: ${dto.name}`);
    await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
    });
  } else {
    console.log(`Não atualizou nome. Estado atual do usuário:`, user);
  }

  // Cria o agendamento normalmente
  return this.prisma.appointment.create({
    data: {
      name: dto.name,
      phone: dto.phone,
      date: new Date(dto.date),
      time: dto.time,
      service: dto.service,
      userId,
    },
    include: {
      user: true, // opcional: já retorna os dados do user vinculado
    },
  });
}


}
