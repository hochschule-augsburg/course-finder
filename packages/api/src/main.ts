import { execSync } from 'child_process'

import { startScheduledDeletion } from './domain/cascadingDeletion/deleteData.ts'
import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService.ts'
import { env } from './env.ts'
import { prisma } from './prisma/prisma.ts'
import { createServer } from './server/server.ts'

// Start database from docker container for development
if (env.DEV) {
  execSync(`docker start ${process.env.DEV_DOCKER_DB}`)
}

// Start the server
const server = await createServer()
await prisma.$connect()

try {
  await prisma.appConf.create({})
} catch {
  // Do nothing
}

await startPhaseSchedulingFromDatabase()
startScheduledDeletion()

await server.start()
await prisma.$disconnect()
