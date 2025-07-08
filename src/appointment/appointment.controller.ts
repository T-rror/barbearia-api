import { Body, Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/appointment';
import { AuthGuard } from '../auth/auth.guard';

@Controller('appointment')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: CreateAppointmentDto, @Req() req: Request) {
    const user = req.user as { id: string }; // vem do token
    return this.appointmentService.create(body, user.id);
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
 