import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // opcional: torna acessível globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- isso é essencial
})
export class PrismaModule {}
