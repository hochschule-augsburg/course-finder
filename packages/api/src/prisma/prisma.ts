import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('env DATABASE_URL is required')
}
const connectionString: string = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
// check connection
;(await pool.connect()).release()
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
