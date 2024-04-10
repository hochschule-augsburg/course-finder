import { serverConfig } from '../../config'
import { setupServices } from './domain/services'
import { prisma } from './prisma'
import { createServer } from './server'

setupServices()
const server = await createServer(serverConfig)
await prisma.$connect()

await server.start()
await prisma.$disconnect()
