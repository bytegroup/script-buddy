import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Global prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS ─────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global pipes ─────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform types (string → number etc.)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filters & interceptors ────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ──────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Appifylab Social API')
    .setDescription(
      'Complete REST API for the Appifylab Social platform.\n\n' +
      'Authentication: Use the /auth/login endpoint to get an access token, ' +
      'then click "Authorize" and enter: Bearer <your_token>',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('posts', 'Post CRUD, likes, and feed')
    .addTag('comments', 'Comment management and likes')
    .addTag('replies', 'Reply management and likes')
    .addTag('cloudinary', 'Signed image upload')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Root health check
  const server = app.getHttpAdapter().getInstance();
  server.get('/', (req: any, res: any) => {
    res.json({
      status: 'ok',
      message: 'API is running 🚀',
      timestamp: new Date(),
    });
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`\n🚀 Appifylab API running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger UI:              http://localhost:${port}/api/docs\n`);
}

bootstrap();
