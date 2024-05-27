import { PrismaClient } from '@prisma/client';

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
