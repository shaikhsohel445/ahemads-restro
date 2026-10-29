import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BRAND, type DemoRequestDto } from '@ahemads-restro/types';
import { detach } from '../../cloudflare/bindings';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const BRANCH_LABEL: Record<DemoRequestDto['branches'], string> = {
  '1': '1 branch',
  '2-5': '2–5 branches',
  '6-20': '6–20 branches',
  '21+': '21+ branches',
};

// Demo requests from the public marketing site. Every request is stored in
// D1 first (so nothing is lost when e-mail is not set up), then — if
// DEMO_NOTIFY_EMAIL and the e-mail provider are configured — the vendor is
// notified. The visitor only sees "received" once the row is saved.
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async createDemoRequest(
    dto: DemoRequestDto,
    meta: { ipCountry?: string | null; userAgent?: string | null },
  ) {
    const row = await this.prisma.demoRequest.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        country: dto.country,
        branches: dto.branches,
        message: dto.message ?? '',
        locale: dto.locale ?? 'en',
        ipCountry: meta.ipCountry ?? null,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      },
      select: { id: true, createdAt: true },
    });
    detach(this.notify(row.id, dto));
    return { ok: true, id: row.id };
  }

  list(take = 100) {
    return this.prisma.demoRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(take, 1), 500),
    });
  }

  private async notify(id: string, dto: DemoRequestDto) {
    const to = this.config.get<string>('DEMO_NOTIFY_EMAIL');
    if (!to || !this.email.isConfigured()) return;
    try {
      await this.email.send({
        to,
        subject: `${BRAND.productName} demo request — ${dto.company} (${dto.country})`,
        text: [
          `New demo request for ${BRAND.productName}`,
          '',
          `Name:      ${dto.name}`,
          `Company:   ${dto.company}`,
          `E-mail:    ${dto.email}`,
          `Phone:     ${dto.phone}`,
          `Country:   ${dto.country}`,
          `Branches:  ${BRANCH_LABEL[dto.branches]}`,
          `Language:  ${dto.locale}`,
          '',
          dto.message || '(no message)',
          '',
          `Request id: ${id}`,
        ].join('\n'),
      });
      await this.prisma.demoRequest.update({
        where: { id },
        data: { notified: true },
      });
    } catch (err) {
      this.logger.warn(
        `Demo request ${id} saved but the notification e-mail failed: ${String(err)}`,
      );
    }
  }
}
