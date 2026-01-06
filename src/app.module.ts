import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthGuard } from './auth/auth.guard';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [AuthModule, AppointmentModule, PrismaModule, PaymentsModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
