import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { timingSafeEqual } from 'node:crypto';
import { demoRequestSchema, type DemoRequestDto } from '@ahemads-restro/types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { LeadsService } from './leads.service';

// POST is public (the marketing site's demo form). It sits under
// /v1/public so the edge rate limiter covers it, on top of @Throttle.
@ApiTags('public')
@Controller('v1/public')
export class PublicLeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('demo-requests')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(demoRequestSchema))
  create(
    @Body() body: DemoRequestDto,
    @Headers('cf-ipcountry') ipCountry?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    // Honeypot filled in: answer like a success so bots learn nothing, store nothing.
    if (body.website) return { ok: true };
    return this.leads.createDemoRequest(body, { ipCountry, userAgent });
  }
}

// Reading leads is for the software vendor only (not restaurant staff):
// Authorization: Bearer <LEADS_ACCESS_TOKEN>. Unset token = endpoint closed.
@ApiTags('leads')
@Controller('v1/leads')
export class LeadsAdminController {
  constructor(
    private readonly leads: LeadsService,
    private readonly config: ConfigService,
  ) {}

  @Get('demo-requests')
  list(
    @Headers('authorization') authorization?: string,
    @Query('take') take?: string,
  ) {
    const expected = this.config.get<string>('LEADS_ACCESS_TOKEN') ?? '';
    const given = (authorization ?? '').replace(/^Bearer\s+/i, '');
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (
      expected.length < 24 ||
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      throw new UnauthorizedException();
    }
    return this.leads.list(take ? Number(take) : 100);
  }
}
