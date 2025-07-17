import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { signinDTO, signUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import e from 'express';

import { Public } from 'src/common/decorators/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  
  @Public()
  @Post('signup')
  async signup(@Body() body: signUpDTO) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('signin')
  async signin(@Body() body: signinDTO) {
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard) // aqui usamos o guard que verifica o token
  @Get('me')
  async me(@Req() req) {
    return req.user;
  } 
   
  @Public()
   @Post('check-email')
   async checkemail(@Body('email')email: string) {
    return this.authService.checkEmail(email);
} 
}
