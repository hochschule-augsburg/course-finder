import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Datasource only required for migration
let DATABASE_URL: string | undefined = process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.ts',
  },
  datasource: {
    url: DATABASE_URL,
  },
})
