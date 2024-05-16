import { prisma } from './prisma/prisma'
import { startPhaseSchedulingFromDatabase } from './scheduling/scheduleController'
import { createServer } from './server/server'

// Start the server
const server = await createServer(serverConfig)
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()

await server.start()
await prisma.$disconnect()
