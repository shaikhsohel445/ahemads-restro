import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  restoreBackupSchema,
  setBackupConfigSchema,
  type SessionUser,
} from '@ahemads-restro/types';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BackupService } from './backup.service';

// Backups span the whole instance (every restaurant sharing this
// database), so visibility is restricted well above the usual
// `settings.manage` tier: any read leaks the existence/timing of a
// full-instance dump. `backup.manage` is a dedicated permission (not
// reused from settings.manage) specifically so it can be granted to a
// custom role narrowly, without also granting general settings access.
// Restore additionally re-checks the caller's role inside
// `BackupService.restore()` itself — see that method's comment for why.
@ApiTags('backups')
@Controller('v1/backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Auth('backup.manage')
  @Get('status')
  status() {
    return this.backupService.status();
  }

  @Auth('backup.manage')
  @Get()
  list() {
    return this.backupService.list();
  }

  @Auth('backup.manage')
  @Post('config')
  @UsePipes(new ZodValidationPipe(setBackupConfigSchema))
  setConfig(@CurrentUser() user: SessionUser, @Body() body: unknown) {
    return this.backupService.setConfig(user, body as never);
  }

  @Auth('backup.manage')
  @Delete('config')
  clearConfig(@CurrentUser() user: SessionUser) {
    return this.backupService.clearConfig(user);
  }

  @Auth('backup.manage')
  @Post()
  trigger(@CurrentUser() user: SessionUser) {
    return this.backupService.triggerManual(user);
  }

  @Auth('backup.manage')
  @Post(':id/restore')
  @UsePipes(new ZodValidationPipe(restoreBackupSchema))
  restore(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.backupService.restore(user, id, body as never);
  }

  // Local backup: dump the database right now and send it to the browser,
  // so an owner can keep a copy on their own machine. Declared before the
  // ':id/download' route.
  @Auth('backup.manage')
  @Get('export')
  async exportLocal(@CurrentUser() user: SessionUser, @Res() res: Response) {
    const dump = await this.backupService.prepareLocalExport(user);
    const filename = `ahemads-restro-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson.gz`;
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(dump));
  }

  // The stored dump of a VERIFIED backup. See
  // BackupService.prepareDownload() for the state check and its audit call.
  @Auth('backup.manage')
  @Get(':id/download')
  async download(
    @CurrentUser() user: SessionUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { record, data } = await this.backupService.prepareDownload(user, id);
    const filename = `backup-${record.createdAt.toISOString().replace(/[:.]/g, '-')}.ndjson.gz`;
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(data));
  }
}
