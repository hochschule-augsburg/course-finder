import { exec } from 'child_process'

import { startScheduledDeletion } from './domain/cascadingDeletion/deleteData'
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

if (process.argv.slice(2).includes('master')) {
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
