import schedule from 'node-schedule'

import { prisma } from '../../prisma/prisma.ts'

export function startScheduledDeletion() {
  const rule = new schedule.RecurrenceRule()
  rule.month = [11, 6] // December and July
  rule.date = 1 // first of the month
  rule.hour = 0 // 00:00
  rule.minute = 0

  schedule.scheduleJob(rule, async () => {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - 20) // one year and eight months ago
    console.info('Running scheduled task to delete old data...')
    await deleteOldStudents(cutoffDate)
    await deleteOldStudentData(cutoffDate)
  })
}

async function deleteOldStudentData(cutoffDate: Date): Promise<void> {
  try {
    const deletedStudentData = await prisma.studentPhase.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    console.log(
      `Deleted ${deletedStudentData.count} student data entries that were created before ${cutoffDate.toLocaleString()}`,
    )
  } catch (e) {
    console.error('Error deleting old data:', e)
  }
}

async function deleteOldStudents(cutoffDate: Date): Promise<void> {
  try {
    const deletedStudents = await prisma.user.deleteMany({
      where: {
        lastActive: {
          lt: cutoffDate,
        },
        type: 'Student',
      },
    })
    console.log(
      `Deleted ${deletedStudents.count} students who were enrolled before ${cutoffDate.toLocaleString()}`,
    )
  } catch (e) {
    console.error('Error deleting old data:', e)
  }
}
