import { deleteOldStudentData } from './domain/cascadingDeletion/deleteData'
import { startPhaseSchedulingFromDatabase } from './domain/phase/PhaseService'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'
import cron from 'node-cron';

const server = await createServer()
await prisma.$connect()

// Start the registration cycle
startPhaseSchedulingFromDatabase()
cron.schedule('0 0 1 */6 *', () => {
        console.log('Running scheduled job to delete old student data');
        deleteOldStudentData();
    });
console.log('Scheduler is set up to run every 6 months.');

await server.start()
await prisma.$disconnect()