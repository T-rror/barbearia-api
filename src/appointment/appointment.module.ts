import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importando o módulo Prisma

@Module({ 
  imports: [PrismaModule],
  providers: [AppointmentService],
  controllers: [AppointmentController]
})
export class AppointmentModule {}
