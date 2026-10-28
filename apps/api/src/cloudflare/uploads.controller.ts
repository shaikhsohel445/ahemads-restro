import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { StorageService } from './storage.service';

// GET /api/uploads/:name — public menu photos and logos from R2. Replaces the
// express.static mount on UPLOADS_DIR; same URL, so stored image URLs and
// the public QR menu keep working unchanged.
@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Get(':name')
  async get(@Param('name') name: string, @Res() res: Response) {
    const obj = await this.storage.getPublicImage(name);
    if (!obj) throw new NotFoundException();
    res.setHeader(
      'Content-Type',
      obj.httpMetadata?.contentType ?? 'application/octet-stream',
    );
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('ETag', obj.httpEtag);
    res.send(Buffer.from(await obj.arrayBuffer()));
  }
}
