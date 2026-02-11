import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

let DATABASE_URL = process.env.DATABASE_URL
if (!process.env.CI && !DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
