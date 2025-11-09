import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { signinDTO, signUpDTO } from './dtos/auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: signUpDTO) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userAlreadyExists) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prismaService.user.create({
       data: {
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    role: data.role ?? Role.CLIENTE,
   },
        
      select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
     
    };
  }

  async signin(data: signinDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, 
    });

    return {
      accessToken, 
      role: user.role,
    };
  } 


  async checkEmail(email: string) {
  const user = await this.prismaService.user.findUnique({
    where: { email },
  });

  return {
    exists: !!user,
  };
}

}
