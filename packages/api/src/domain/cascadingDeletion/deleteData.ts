import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
const prisma = new PrismaClient();

export async function deleteOldStudentData() {
  const oneAndHalfYearsAgo = new Date();
  oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18); // 1.5 years ago

  try {
    const result = await prisma.student.deleteMany({
      where: {
        createdAt: {
          lt: oneAndHalfYearsAgo,
        },
      },
    });

    console.log(`Deleted ${result.count} old student records.`);
  } catch (error) {
    console.error('Error deleting old student records:', error);
  }
}

export async function startCronJob() {
  cron.schedule('0 0 1 */6 *', () => {
    console.log('Running scheduled job to delete old student data');
    deleteOldStudentData();
  });
  console.log('Scheduler is set up to run every 6 months.');
}
