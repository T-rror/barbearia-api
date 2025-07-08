import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, AppointmentModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
