import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class signUpDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
    message: 'Telefone deve estar no formato (XX)XXXXX-XXXX',
  })
  phone: string;  
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
