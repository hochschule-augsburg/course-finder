import { z } from 'zod'

const envSchema = z.object({
  CONTACT_EMAIL: z.string().email(),
  DATABASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string(),
  JWT_SECRET: z.string().min(32),
  LDAP_BASE_DN: z.string(),
  LDAP_URL: z.string().url(),
  MAIL_RECEIVERS: z
    .string()
    .transform((e) => e.split(',').map((e) => e.trim())),
  SERVER_HOSTNAME: z.string(),
  SERVER_PORT: z.coerce.number(),
})

// This line will throw an error if there’s a missing environment variable, or if its value is invalid.
export const env = envSchema.parse(process.env)
