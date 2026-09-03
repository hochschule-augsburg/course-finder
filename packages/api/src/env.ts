import { z } from 'zod'

const DEV = process.env.NODE_ENV !== 'production'

const envSchema = z.object({
  AI_API_KEY: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  CONTACT_EMAIL: z.email(),
  DATABASE_URL: z.url(),
  FRONTEND_ORIGIN: z.string(),
  JWT_SECRET: z.string().min(32),
  LDAP_BASE_DN: z.string(),
  LDAP_URL: z.url(),
  LOG_LEVEL: z.string().default('warn'),
  MAIL_FROM_ADDRESS: z
    .string()
    .default('no-reply@course-finder.informatik.tha.de'),
  MAIL_FROM_NAME: z.string().default('CourseFinder'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  SERVER_HOSTNAME: z.string(),
  SERVER_PORT: z.coerce.number(),
  SMTP_HOST: z.string().default('smtp.hs-augsburg.de'),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(25),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  SMTP_USER: z.string().optional(),
})

const envParsed = envSchema.parse(process.env)

export const env = {
  ...envParsed,
  DEV,
}
