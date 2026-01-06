import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payments.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Cliente ou ADM cria pagamento
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  // ADM confirma pagamento manualmente
  @UseGuards(AuthGuard)
  @Post(':id/confirm')
  confirm(
    @Param('id') paymentId: string,
    @Req() req: Request,
  ) {
    const adminId = req['user'].sub; // vem do JWT
    const role = req['user'].role;

    if (role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    return this.paymentsService.confirmPayment(paymentId, adminId);
  }

  // Listar pagamentos de um agendamento
  @UseGuards(AuthGuard)
  @Get('appointment/:appointmentId')
  findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.paymentsService.findByAppointment(appointmentId);
  }
}
