import { execSync } from 'child_process'

import { startScheduledDeletion } from './domain/cascadingDeletion/deleteData.ts'
import { PhaseService } from './domain/phase/PhaseService.ts'
import { env } from './env.ts'
import { prisma } from './prisma/prisma.ts'
import { createServer } from './server/server.ts'

// Start database from docker container for development
if (env.DEV) {
  if (
    execSync(
      `docker container inspect -f '{{.State.Running}}' ${process.env.DEV_DOCKER_DB}`,
    )
      .toString()
      .trim() === 'false'
  ) {
    execSync(`docker start ${process.env.DEV_DOCKER_DB}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}
console.log(env.DEV ? 'Dev Mode' : 'Production mode')
console.log(env.MAIL_RECEIVERS, env.CONTACT_EMAIL)

// Start the server
const server = await createServer()
await prisma.$connect()

try {
  await prisma.appConf.create({})
} catch {
  // Do nothing
}

await PhaseService.startPhaseSchedulingFromDatabase()
startScheduledDeletion()

await server.start()
await prisma.$disconnect()
