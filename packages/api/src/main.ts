import { serverConfig } from './config'
import { prisma } from './prisma'
import { createServer } from './server'

const server = await createServer(serverConfig)
await prisma.$connect()

await server.start()
await prisma.$disconnect()
