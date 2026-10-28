import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { workerEnv } from './bindings';

// Cloudflare R2 storage, replacing the local UPLOADS_DIR volume.
//
// One bucket (binding UPLOADS), two prefixes:
//   uploads/<uuid>.<ext>        menu photos and restaurant logos. Served
//                               publicly by GET /api/uploads/:name (the same
//                               URL shape the self-hosted build used, so
//                               saved imageUrl/logoUrl values keep working).
//   documents/<uuid>            document attachments; private, only ever
//                               streamed back through an authenticated,
//                               branch-checked endpoint.
// Object keys are random UUIDs, never derived from client file names.
@Injectable()
export class StorageService {
  private get bucket() {
    return workerEnv().UPLOADS;
  }

  async putPublicImage(
    bytes: Uint8Array,
    ext: string,
    contentType: string,
  ): Promise<string> {
    const name = `${randomUUID()}${ext}`;
    await this.bucket.put(`uploads/${name}`, bytes, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
    return name;
  }

  async putPrivate(
    prefix: 'documents',
    bytes: Uint8Array,
    contentType: string,
  ): Promise<string> {
    const key = `${prefix}/${randomUUID()}`;
    await this.bucket.put(key, bytes, { httpMetadata: { contentType } });
    return key;
  }

  async getPublicImage(name: string) {
    // Names are `<uuid>.<ext>`; anything else (path segments, dot-dot) is
    // rejected before it reaches R2.
    if (!/^[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return null;
    return this.bucket.get(`uploads/${name}`);
  }

  async getBytes(key: string): Promise<Uint8Array | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    return new Uint8Array(await obj.arrayBuffer());
  }

  async delete(key: string) {
    await this.bucket.delete(key);
  }
}
