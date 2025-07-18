import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  app.enableCors({
    origin: 'http://localhost:3000', // ou '*' se quiser liberar geral (não recomendado para produção)
    credentials: true, // se você estiver usando cookies/autenticação
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
