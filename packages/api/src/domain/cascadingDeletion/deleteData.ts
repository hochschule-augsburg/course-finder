import schedule from 'node-schedule'

import { prisma } from '../../prisma/prisma'

export async function deleteOldData(cutoffDate: Date): Promise<void> {
  try {
    const deletedCount = await prisma.student.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    console.log(
      `Deleted ${deletedCount.count} students who were enrolled before ${cutoffDate}`,
    )
  } catch (e) {
    console.error('Error deleting old data:', e)
  }
}

export async function startScheduledDeletion() {
  const cutoffDate = new Date()
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1.5)

  const rule = new schedule.RecurrenceRule()
  rule.date = 1 // Erster Tag des Monats
  rule.hour = 0 // 00:00 Uhr
  rule.month = [1, 8] // Februar und September

  schedule.scheduleJob(rule, async () => {
    console.log('Running scheduled task to delete old data...')
    await deleteOldData(cutoffDate)
  })
}
