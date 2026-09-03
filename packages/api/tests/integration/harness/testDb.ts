import { prisma } from '../../../src/prisma/prisma.ts'

export async function cleanDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "PhaseAssignment", 
      "StudentChoice", 
      "StudentPhase", 
      "OfferedCourse", 
      "Course", 
      "Enrollphase", 
      "Student", 
      "User", 
      "AppConf" 
    CASCADE;
  `)
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}

export { prisma }
