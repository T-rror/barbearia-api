import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  app.enableCors({
    origin: 'https://barbearia-app-tau.vercel.app', // ou '*' se quiser liberar geral (não recomendado para produção)
    credentials: true, // se você estiver usando cookies/autenticação
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen('https://barbearia-app-tau.vercel.app');
}
bootstrap();
