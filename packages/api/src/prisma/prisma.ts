import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { env } from '../env.ts'

const connectionString: string = env.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({ adapter })
