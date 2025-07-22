import { Body, Controller, Get, Post, Param, Req, UseGuards, Patch, ParseUUIDPipe, ForbiddenException  } from '@nestjs/common';
import { Request } from 'express';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/appointment';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';



@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: CreateAppointmentDto, @Req() req: AuthenticatedRequest) {
    // req.user já está tipado, sem precisar usar "as"
    const userId = req.user.id;
    return this.appointmentService.create(body, userId);
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
  if (user.role !== 'BAREIRO') {
    throw new ForbiddenException('Acesso negado');
  }
  return this.appointmentService.findConcluidos();
}



  
}
 