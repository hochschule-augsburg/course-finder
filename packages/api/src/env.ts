import { z } from 'zod'

const DEV = process.env.NODE_ENV !== 'production'

const envSchema = z.object({
  AI_API_KEY: DEV ? z.optional(z.string()).default('') : z.string(),
  CONTACT_EMAIL: z.string().email(),
  DATABASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string(),
  JWT_SECRET: z.string().min(32),
  LDAP_BASE_DN: z.string(),
  LDAP_URL: z.string().url(),
  LOG_LEVEL: z.string().default('warn'),
  MAIL_RECEIVERS: z
    .string()
    .transform((e) => e.split(',').map((e) => e.trim())),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  SERVER_HOSTNAME: z.string(),
  SERVER_PORT: z.coerce.number(),
})

const envParsed = envSchema.parse(process.env)

export const env = {
  ...envParsed,
  DEV,
}
