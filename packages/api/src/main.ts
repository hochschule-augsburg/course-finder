import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'

// Start the server
const server = await createServer()
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()

await server.start()
await prisma.$disconnect()
