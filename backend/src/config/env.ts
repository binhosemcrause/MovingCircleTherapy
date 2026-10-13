import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-AU', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(2592000),
  CORS_ORIGIN: z.string().default('*'),
  // Therapists' working hours are wall-clock times in this IANA timezone.
  PRACTICE_TIMEZONE: z
    .string()
    .default('Australia/Sydney')
    .refine(isTimeZone, 'PRACTICE_TIMEZONE must be an IANA timezone, e.g. Australia/Sydney'),
  // Booking emails to therapists are sent through Resend; with either of
  // these unset the emails are skipped.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
