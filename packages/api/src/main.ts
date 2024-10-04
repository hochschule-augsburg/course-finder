import { exec } from 'child_process'

import { startScheduledDeletion } from './domain/cascadingDeletion/deleteData.ts'
import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService.ts'
import { prisma } from './prisma/prisma.ts'
import { createServer } from './server/server.ts'

// start database from docker container for development
if (process.env.NODE_ENV !== 'production') {
  exec(`docker start ${process.env.DEV_DOCKER_DB}`)
}

// Start the server
const server = await createServer()
await prisma.$connect()

if (
  process.env.NODE_ENV === 'development' ||
  process.argv.slice(2).includes('master')
) {
  console.log('I am the master process')
  try {
    await prisma.appConf.create({})
  } catch {
    // Do nothing
  }

  // Start the registration cycle
  await startPhaseSchedulingFromDatabase()
  startScheduledDeletion()
}

await server.start()
await prisma.$disconnect()
