import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  FRONTEND_HOSTNAME: z.string(),
  LDAP_BASE_DN: z.string(),
  LDAP_URL: z.string(),
  MAIL_RECEIVERS: z.string(),
  MAIL_SENDER_PASSWORD: z.string(),
  MAIL_SENDER_USERNAME: z.string(),
  SERVER_HOSTNAME: z.string(),
  SERVER_PORT: z.string(),
  SESSION_SECRET: z.string(),
})

// This line will throw an error if there’s a missing environment variable, or if its value is invalid.
const env = envSchema.parse(process.env)
export default env
