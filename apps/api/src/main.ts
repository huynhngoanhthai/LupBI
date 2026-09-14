import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parsing
  app.use(cookieParser());

  // Global DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS - allow frontend origin
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true, // ⚠️ Bắt buộc để gửi/nhận HTTP-Only Cookie
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}`);
}

bootstrap();
