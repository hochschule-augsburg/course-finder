import { serverConfig } from '../../config'
import { prisma } from './prisma/prisma'
import { scheduleRegistration } from './scheduling/scheduleController'
import { createServer } from './server/server'

// Start the server
const server = await createServer(serverConfig)
await prisma.$connect()

// Start the registration cycle
scheduleRegistration()

await server.start()
await prisma.$disconnect()
