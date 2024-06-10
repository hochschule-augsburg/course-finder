import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

import { env } from '../env'

const connectionString: string = env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
// check connection
setTimeout(async () => (await pool.connect()).release(), 10)
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
