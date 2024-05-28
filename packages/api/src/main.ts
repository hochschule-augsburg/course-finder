import { deleteOldData } from './domain/cascadingDeletion/deleteData'
import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'
import cron from 'node-cron';

const server = await createServer()
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()

const cutoffDate = new Date();
cutoffDate.setFullYear(cutoffDate.getFullYear() - 1.5);

// Cron-Job, der alle 6 Monate ausgeführt wird
cron.schedule('0 0 1 */6 *', async () => {
  console.log('Running scheduled task to delete old data...');
  await deleteOldData(cutoffDate);
});


await server.start()
await prisma.$disconnect()