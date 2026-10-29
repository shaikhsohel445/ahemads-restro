import { z } from "zod";

// Demo request from the public marketing site. Only what is needed to
// qualify and answer the inquiry. `website` is a honeypot: real visitors
// never see or fill it, so a non-empty value marks a bot.
export const demoRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[+()\d\s.-]+$/, "Use digits, spaces and + ( ) - only"),
  company: z.string().trim().min(2).max(150),
  country: z.string().trim().min(2).max(80),
  branches: z.enum(["1", "2-5", "6-20", "21+"]),
  message: z.string().trim().max(2000).optional().default(""),
  locale: z.enum(["en", "ar"]).optional().default("en"),
  website: z.string().max(0).optional().default(""),
});
export type DemoRequestDto = z.infer<typeof demoRequestSchema>;
