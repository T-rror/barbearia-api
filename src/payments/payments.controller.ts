import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payments.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { AuthUser } from '../auth/types/auth-user.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/admin.guards';
import { Role } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Cliente ou ADM cria pagamento
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: AuthenticatedRequest) {
    const user = req.user as AuthUser;
    return this.paymentsService.create(dto, user.id, user.role);
  }

  @Roles(Role.ADMIN, Role.BARBEIRO)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // ADM confirma pagamento manualmente
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':id/confirm')
  confirm(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user as AuthUser;

    return this.paymentsService.confirmPayment(paymentId, user.id);
  }

  // Listar pagamentos de um agendamento
  @UseGuards(AuthGuard)
  @Get('appointment/:appointmentId')
  findByAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user as AuthUser;
    return this.paymentsService.findByAppointment(
      appointmentId,
      user.id,
      user.role,
    );
  }
}
