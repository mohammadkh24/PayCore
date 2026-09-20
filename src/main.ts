import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const server = app.getHttpAdapter().getInstance();

  const port = configService.get('app.port');

  app.enableCors({
    origin: 'http://localhost:5500',
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('product-manage')
    .setDescription('.........')
    .addBearerAuth()
    .setVersion('1.0.0')
    .addTag("Auth")
    .addTag("Users")
    .addTag("Products")
    .addTag("Orders")
    .addTag("Payments")
    
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  server.get('/docs/json', (_req: Request, res: Response) => {
    res.json(document);
  });

  await app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
    console.log(`Swagger UI available at http://localhost:${port}/docs`);
    console.log(
      `Swagger JSON available at http://localhost:${port}/swagger/json`,
    );
  });
}
bootstrap();
