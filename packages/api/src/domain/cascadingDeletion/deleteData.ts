import { PrismaClient } from '@prisma/client';
import schedule from 'node-schedule';

const prisma = new PrismaClient();

export async function deleteOldData(cutoffDate: Date): Promise<void> {
  try {
    const deletedCount = await prisma.student.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    console.log(`Deleted ${deletedCount.count} students who were enrolled before ${cutoffDate}`);
  } catch (error) {
    console.error(`Failed to delete old data: ${(error as Error).message}`);
    throw new Error(`Failed to delete old data: ${(error as Error).message}`);
  }
}

// export async function startScheduledDeletion () {
//   const cutoffDate = new Date();
//   cutoffDate.setFullYear(cutoffDate.getFullYear() - 1.5);

//   // Cron-Job, der alle 6 Monate ausgeführt wird
//   cron.schedule('0 0 1 */6 *', async () => {
//     console.log('Running scheduled task to delete old data...');
//     await deleteOldData(cutoffDate);
//   });
// }

export async function startScheduledDeletion() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1.5);

  const rule = new schedule.RecurrenceRule();
  rule.date = 1; // Erster Tag des Monats
  rule.hour = 0; // 00:00 Uhr
  rule.minute = 0; // 00 Minuten
  rule.month = [1, 8]; // Februar und September

  schedule.scheduleJob(rule, async () => {
    console.log('Running scheduled task to delete old data...');
    await deleteOldData(cutoffDate);
  });
}