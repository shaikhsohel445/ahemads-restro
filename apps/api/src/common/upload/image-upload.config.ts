import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import type { Request } from 'express';
import { memoryStorage, type FileFilterCallback } from 'multer';

// Uploads are buffered in memory (max 5 MB) and then written to R2 by
// StorageService — a Worker has no writable disk for multer's diskStorage.

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !file.mimetype.startsWith('image/')) {
      cb(
        new BadRequestException(
          'Only image files (jpg, png, webp, gif) are allowed',
        ),
      );
      return;
    }
    cb(null, true);
  },
};

// Magic-byte signatures for the formats ALLOWED_EXTENSIONS accepts.
// `fileFilter` above only sees the client-declared filename/mimetype —
// neither is trustworthy. This checks the actual bytes, so a renamed or
// mislabeled non-image (e.g. an .html or .svg file sent as "photo.jpg" with a
// spoofed Content-Type: image/jpeg) is rejected before it is stored and
// served back under /api/uploads/.
const SIGNATURES: { ext: string; mime: string; match: (b: Uint8Array) => boolean }[] = [
  {
    ext: '.jpg',
    mime: 'image/jpeg',
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: '.png',
    mime: 'image/png',
    match: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: '.gif',
    mime: 'image/gif',
    match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  },
  {
    ext: '.webp',
    mime: 'image/webp',
    match: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/**
 * Returns the detected format of an uploaded image (from its bytes, not its
 * name), or throws 400 if the content is not a supported image. The stored
 * object's extension and Content-Type come from this, so what is served back
 * always matches what the bytes really are.
 */
export function detectImage(bytes: Uint8Array): { ext: string; mime: string } {
  const header = bytes.subarray(0, 16);
  const found = SIGNATURES.find((sig) => sig.match(header));
  if (!found) {
    throw new BadRequestException(
      'File content does not match a supported image format (jpg, png, webp, gif)',
    );
  }
  return { ext: found.ext, mime: found.mime };
}
