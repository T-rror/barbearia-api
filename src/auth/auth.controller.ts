import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { signinDTO, signUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: signUpDTO) {
    return this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: signinDTO) {
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard) // aqui usamos o guard que verifica o token
  @Get('me')
  async me(@Req() req) {
    return req.user;
  } 

   @Post('magic-login')
  async magicLogin(@Body('email') email: string) {
    return this.authService.magicLogin(email);
  }
}
