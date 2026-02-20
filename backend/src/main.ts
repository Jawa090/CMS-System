import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  // Winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `${timestamp} [${context}] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  const config = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://localhost:3002', 
      'http://localhost:8080', 
      'http://localhost:8081',
      'http://localhost:5174',
      'http://localhost:4173',
      // Add your production URLs here
      // 'https://yourwebsite.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept', 
      'Origin',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Global prefix
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger documentation
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ReactCMS API')
      .setDescription('AI-Powered CMS Crawler Platform — Complete REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Projects', 'Project/site management')
      .addTag('Crawler', 'Web crawling engine')
      .addTag('Pages', 'Page management')
      .addTag('Content Blocks', 'Editable content blocks')
      .addTag('SEO', 'SEO metadata management')
      .addTag('Media', 'File upload and media library')
      .addTag('Analytics', 'Page analytics')
      .addTag('Jobs', 'Background job monitoring')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`\n🚀 ReactCMS API running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger Docs:             http://localhost:${port}/docs\n`);
}

bootstrap();
