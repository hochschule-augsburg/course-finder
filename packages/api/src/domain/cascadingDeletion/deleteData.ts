import { PrismaClient } from '@prisma/client';
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

