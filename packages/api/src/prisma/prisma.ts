import { PrismaPg } from '@prisma/adapter-pg'

import { env } from '../env.ts'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString: string = env.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({ adapter })
