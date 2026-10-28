import {
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';
import { WriteLockMiddleware } from './write-lock.middleware';

// Cloudflare-specific infrastructure shared by every module: R2 object
// storage and the per-restaurant write lock.
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '12h',
          },
        }) as JwtModuleOptions,
    }),
  ],
  controllers: [UploadsController],
  providers: [StorageService, WriteLockMiddleware],
  exports: [StorageService, WriteLockMiddleware],
})
export class CloudflareModule implements NestModule {
  // Every route: the middleware itself skips GET/HEAD/OPTIONS.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WriteLockMiddleware).forRoutes('*');
  }
}
