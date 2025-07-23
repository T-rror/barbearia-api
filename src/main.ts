import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  app.enableCors({
    origin: 'https://barbearia-app-tau.vercel.app', // ou '*' se quiser liberar geral (não recomendado para produção)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // se você estiver usando cookies/autenticação
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen('process.env.PORT || 3001');
}
bootstrap();
