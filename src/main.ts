import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust the first proxy hop so req.protocol reflects the public-facing scheme
  // (https) rather than the internal http used inside Codespaces / reverse proxies
  app.set('trust proxy', 1);
  const configService = app.get(ConfigService);

  // Validation: Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Security: Validate session secret is set
  const sessionSecret = configService.get<string>('SESSION_SECRET');
  if (!sessionSecret) {
    throw new Error(
      'SESSION_SECRET must be set in environment variables for production',
    );
  }

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax', // 'strict' blocks the cross-site OAuth callback redirect
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const viewsPath = join(__dirname, '..', 'views');
  app.setBaseViewsDir(viewsPath);

  nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
  });

  app.setViewEngine('njk');

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

void bootstrap();
