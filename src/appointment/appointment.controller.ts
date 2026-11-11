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
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentAdminDto,
  CreateAppointmentDto,
} from './dtos/appointment';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { RolesGuard } from '../auth/admin.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // Criação de agendamento normal (usuário logado)
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() body: CreateAppointmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.appointmentService.create(body, userId);
  }

  // Criação de agendamento por admin ou barbeiro

  @Roles(Role.ADMIN, Role.BARBEIRO)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('admin')
  async createByAdmin(@Body() dto: CreateAppointmentAdminDto) {
    return this.appointmentService.createByAdmin(dto);
  }

  // Listar todos os agendamentos (pendentes, concluídos e cancelados)
  @Roles(Role.ADMIN, Role.BARBEIRO)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async findAll() {
    const agendamentos = await this.appointmentService.findAll();

    const pendentes = agendamentos.filter((a) => a.status === 'PENDENTE');
    const concluidos = agendamentos.filter((a) => a.status === 'CONCLUIDO');
    const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO');

    return { success: true, pendentes, concluidos, cancelados };
  }

  // Listar agendamentos por data
  @Public()
  @Get('by-date/:date')
  async findByDate(@Param('date') date: string) {
    const appointments = await this.appointmentService.findByDate(date);
    return { appointments };
  }

  // Marcar agendamento como concluído
  @Roles(Role.ADMIN, Role.BARBEIRO)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id/concluir')
  async concluirAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentService.marcarComoConcluido(id);
    return { success: true, appointment };
  }

  // Marcar agendamento como cancelado
  @Roles(Role.ADMIN, Role.BARBEIRO)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id/cancelar')
  async cancelarAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentService.cancelarAgendamento(id);
    return { success: true, appointment };
  }
}
