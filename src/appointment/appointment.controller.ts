import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Patch,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentAdminDto,
  CreateAppointmentDto,
} from './dtos/appointment';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { AdminGuard, RolesGuard } from '../auth/admin.guards'; // ajuste o caminho

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() body: CreateAppointmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // req.user já está tipado, sem precisar usar "as"
    const userId = req.user.id;
    return this.appointmentService.create(body, userId);
  }
  @Post('admin')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN', 'BARBEIRO']))
  createByAdminOuBarbeiro(@Body() dto: CreateAppointmentAdminDto) {
    return this.appointmentService.createByAdmin(dto);
  }

  @Get()
  async findAll() {
    return this.appointmentService.findAll();
  }

  @Get('by-date/:date')
  async findByDate(@Param('date') date: string) {
    return this.appointmentService.findByDate(date);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/concluir')
  concluirAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentService.marcarComoConcluido(id);
  }

  @Get('concluidos')
  @UseGuards(AuthGuard)
  async findConcluidos(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (user.role !== 'BARBEIRO') {
      throw new ForbiddenException('Acesso negado');
    }
    return this.appointmentService.findConcluidos();
  }

  @UseGuards(AuthGuard)
  @Patch(':id/cancelar')
  cancelarAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentService.cancelarAgendamento(id);
  }
  @UseGuards(AuthGuard)
@Get('cancelados')
async findCancelados(@Req() req: AuthenticatedRequest) {
  const user = req.user;
  if (user.role !== 'BARBEIRO') {
    throw new ForbiddenException('Acesso negado');
  }
  return this.appointmentService.findCancelados();
}


}