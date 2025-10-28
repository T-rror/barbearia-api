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
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';
import { RolesGuard } from '../auth/admin.guards';

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
    const appointment = await this.appointmentService.create(body, userId);
    return { message: 'Agendamento criado com sucesso!' };
  }

  // Criação de agendamento por admin ou barbeiro
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN', 'BARBEIRO']))
  @Post('admin')
  async createByAdmin(@Body() dto: CreateAppointmentAdminDto) {
    const appointment = await this.appointmentService.createByAdmin(dto);
    return { message: 'Agendamento criado por barbeiro!' };
  }

  // Listar todos os agendamentos (pendentes, concluídos e cancelados)
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const agendamentos = await this.appointmentService.findAll();

    const pendentes = agendamentos.filter(a => a.status === 'PENDENTE');
    const concluidos = agendamentos.filter(a => a.status === 'CONCLUIDO');
    const cancelados = agendamentos.filter(a => a.status === 'CANCELADO');

    return { success: true, pendentes, concluidos, cancelados };
  }

  // Listar agendamentos por data
  @Get('by-date/:date')
  async findByDate(@Param('date') date: string) {
    const appointments = await this.appointmentService.findByDate(date);
    return { message: 'Agendamentos agrupados por data!' };
  }

  // Marcar agendamento como concluído
  @UseGuards(AuthGuard)
  @Patch(':id/concluir')
  async concluirAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentService.marcarComoConcluido(id);
    return { success: true, appointment };
  }

  // Marcar agendamento como cancelado
  @UseGuards(AuthGuard)
  @Patch(':id/cancelar')
  async cancelarAgendamento(@Param('id', new ParseUUIDPipe()) id: string) {
    const appointment = await this.appointmentService.cancelarAgendamento(id);
    return { success: true, appointment };
  }
}
