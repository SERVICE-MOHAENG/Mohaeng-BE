import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from './global/interceptors/ResponseInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // API 글로벌 접두어 설정 (모든 엔드포인트)
  app.setGlobalPrefix('api');

  // 전역 필터 설정
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 전역 인터셉터 설정
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성 전달 시 에러 발생
      transform: true, // 요청 데이터를 DTO 인스턴스로 자동 변환
      transformOptions: {
        enableImplicitConversion: true, // 타입 자동 변환 (예: string -> number)
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Mohaeng API')
    .setDescription('Mohaeng API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
