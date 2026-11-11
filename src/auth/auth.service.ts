import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { signinDTO, signUpDTO } from './dtos/auth';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: signUpDTO) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: Role;
    };
    try {
      user = await this.prismaService.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          role: Role.CLIENTE,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }

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
      select: { id: true, role: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
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
      select: { id: true },
    });

    return {
      exists: !!user,
    };
  }
}
