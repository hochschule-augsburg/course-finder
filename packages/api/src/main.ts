import { startCronJob } from './domain/cascadingDeletion/deleteData'
import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'

const server = await createServer()
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()
startCronJob();

await server.start()
await prisma.$disconnect()