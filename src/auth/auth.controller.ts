import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { signinDTO, signUpDTO } from './dtos/auth';
import { AuthService } from './auth.service';

import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() body: signUpDTO) {
    return this.authService.signup(body);
  }

  @Public()
  @Post('signin')
  signin(@Body() body: signinDTO) {
    return this.authService.signin(body);
  }
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Public()
  @Post('check-email')
  checkemail(@Body('email') email: string) {
    return this.authService.checkEmail(email);
  }
}
