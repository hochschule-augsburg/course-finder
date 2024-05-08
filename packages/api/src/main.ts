import { serverConfig } from '../../config'
import { prisma } from './prisma/prisma'
import { startScheduling } from './scheduling/scheduleController'
import { createServer } from './server/server'

// Start the server
const server = await createServer(serverConfig)
await prisma.$connect()

// Start the registration cycle
startScheduling()
await server.start()
await prisma.$disconnect()
