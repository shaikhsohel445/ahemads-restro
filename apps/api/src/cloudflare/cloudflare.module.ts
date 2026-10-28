import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';
import { WriteLockService } from './write-lock.service';

// Cloudflare-specific infrastructure shared by every module: R2 object
// storage and the per-restaurant write lock (applied in src/worker.ts).
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
  providers: [StorageService, WriteLockService],
  exports: [StorageService, WriteLockService],
})
export class CloudflareModule {}
