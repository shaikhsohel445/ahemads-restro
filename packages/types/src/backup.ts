import { z } from "zod";

// Literal-string confirm, matching zulivio's restore safety gate exactly —
// a deliberate speed bump before the single most destructive action in
// this app (drops and recreates the entire shared Postgres instance).
export const restoreBackupSchema = z.object({
  confirm: z.literal("RESTORE"),
});
export type RestoreBackupDto = z.infer<typeof restoreBackupSchema>;

// Cloudflare edition: backups go to the deployment's bound R2 bucket, so the
// S3 connection fields are optional and ignored by the API (older clients may
// still send them). Only the schedule (intervalDays / retainCount) is saved.
export const setBackupConfigSchema = z.object({
  endpoint: z.string().optional(),
  bucket: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  region: z.string().optional(),
  intervalDays: z.coerce.number().int().min(1).max(30).optional(),
  retainCount: z.coerce.number().int().min(1).max(10).optional(),
});
export type SetBackupConfigDto = z.infer<typeof setBackupConfigSchema>;
