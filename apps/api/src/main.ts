import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  const corsOrigin = process.env.CORS_ORIGIN ?? true;
  const app = await NestFactory.create(AppModule);

  const helmetMiddleware = helmet();
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/reference')) return next();
    helmetMiddleware(req, res, next);
  });
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const openApiConfig = new DocumentBuilder()
    .setTitle('Identis API')
    .setDescription("API de vérification d'identité Identis")
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'default',
    }),
  );

  await app.listen(port, host);
  const appUrl = await app.getUrl();
  console.log(`Backend running at ${appUrl}`);
  console.log(`Scalar API reference: ${appUrl}/reference`);
}
void bootstrap();
