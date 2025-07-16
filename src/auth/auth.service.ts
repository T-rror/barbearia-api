import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { signinDTO, signUpDTO } from './dtos/auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../generated/prisma';

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
        ...data,
        password: hashedPassword,
        role: data.role ?? Role.CLIENTE, // usa CLIENTE como padrão
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
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


   async magicLogin(email: string) {
    let user = await this.prismaService.user.findUnique({ where: { email } });

    // Se o usuário não existir, cria
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email,
          
          name: '', // você pode ajustar isso depois
          password: '', // senha vazia para login mágico
          role: Role.CLIENTE, // Define o papel padrão como CLIENTE
        },
      });
    }

    // Gera JWT
    const payload = {
      id: user.id,
      
      email: user.email,
      role: user.role, // Inclui o papel do usuário no payload
    };

    const token = await this.jwtService.signAsync(payload);

    return { token, user };
 
}
}
