import { prisma } from './prisma/prisma'
import { createServer } from './server/server'

void main()

async function main() {
  const server = await createServer()
  await prisma.$connect()

  await server.start()
  await prisma.$disconnect()
}
