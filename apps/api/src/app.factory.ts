import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { BRAND } from '@ahemads-restro/types';
import { AppModule } from './app.module';
import { mountSwaggerUi } from './common/swagger/swagger-ui';

// Known example/placeholder secrets that appear verbatim in this repo's
// .env.example / .dev.vars.example. Refuse to issue or verify sessions signed
// with a known-public or too-short secret instead of silently running with
// one an attacker can read from the public repo.
const KNOWN_PLACEHOLDER_JWT_SECRETS = new Set([
  'please-change-this-to-a-long-random-string',
  'change-me-to-a-long-random-string',
  'change-me',
  'changeme',
  'secret',
  'your-secret-here',
]);
const MIN_JWT_SECRET_LENGTH = 32;

export function isUsableSecret(secret: string): boolean {
  return (
    secret.length >= MIN_JWT_SECRET_LENGTH &&
    !KNOWN_PLACEHOLDER_JWT_SECRETS.has(secret.toLowerCase())
  );
}

// On Workers there is no writable volume to persist a self-generated secret
// in (the self-hosted build did that), so JWT_SECRET must be a Wrangler
// secret: `wrangler secret put JWT_SECRET`. Failing here returns a 503 with
// an explicit message instead of booting with a guessable key.
export function assertJwtSecret(): void {
  const secret = (process.env.JWT_SECRET ?? '').trim();
  if (!isUsableSecret(secret)) {
    throw new Error(
      `JWT_SECRET is missing, a known placeholder, or shorter than ${MIN_JWT_SECRET_LENGTH} characters. ` +
        'Set it with `wrangler secret put JWT_SECRET` (e.g. the output of `openssl rand -hex 32`).',
    );
  }
}

export function corsOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? 'http://localhost:1995')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export async function createApp(): Promise<NestExpressApplication> {
  assertJwtSecret();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(
    helmet({
      // Uploaded images are fetched via an <img> tag through the frontend's
      // same-origin /api proxy — the default helmet CORP header blocks that
      // in some browsers.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // The Swagger UI page loads its bundle from cdnjs (see swagger-ui.ts).
      contentSecurityPolicy: false,
    }),
  );
  app.use(cookieParser());
  app.enableCors({ origin: corsOrigins(), credentials: true });
  app.setGlobalPrefix('api');

  // Full route/schema map — useful in dev, but an information-disclosure
  // surface in production. Opt in explicitly via ENABLE_SWAGGER=true.
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true'
  ) {
    const config = new DocumentBuilder()
      .setTitle(`${BRAND.productName} API`)
      .setDescription(
        `REST API of ${BRAND.productName}, restaurant management software (Cloudflare Workers + D1). Designed & developed by ${BRAND.developer.name} (${BRAND.developer.url}).`,
      )
      .setVersion('2.0')
      .addCookieAuth('nodedr_session')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    mountSwaggerUi(app, document);
  }

  await app.init();
  return app;
}
