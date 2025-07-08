import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '../../../generated/prisma';

export class signUpDTO {
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsOptional()
  role?: Role; // CLIENTE ou BARBEIRO
}

export class signinDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
