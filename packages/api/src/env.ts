import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  FRONTEND_HOSTNAME: z.string(),
  LDAP_BASE_DN: z.string(),
  LDAP_URL: z.string().url(),
  MAIL_RECEIVERS: z.string().transform((e) => e.split(' ')),
  SERVER_HOSTNAME: z.string(),
  SERVER_PORT: z.coerce.number(),
  SESSION_SECRET: z.string().min(32),
})

// This line will throw an error if there’s a missing environment variable, or if its value is invalid.
export const env = envSchema.parse(process.env)
