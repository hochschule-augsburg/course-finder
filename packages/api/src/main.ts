import { exec } from 'child_process'

import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'

// start database from docker container for development
if (process.env.NODE_ENV !== 'production') {
  exec(`docker start ${process.env.DEV_DOCKER_DB}`)
}

// Start the server
const server = await createServer()
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()

await server.start()
await prisma.$disconnect()
