import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { signinDTO, signUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  @Post('signup')
  async signup(@Body() body: signUpDTO) {
    return this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: signinDTO) { 
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard)

  @Get('me')  
  async me(@Request() request) {
    return request.user;
  }
}

