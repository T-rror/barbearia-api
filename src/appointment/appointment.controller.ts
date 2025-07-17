import { Body, Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/appointment';
import { AuthGuard } from '../auth/auth.guard';

// Define o tipo Request que inclui a propriedade user
interface AuthenticatedRequest extends Request {
  user: { id: string; [key: string]: any };
}

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
}
