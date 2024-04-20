import { prisma } from '../../prisma/prisma'
import { AssignmentStudentController } from './AssignmentControllers'
import { normalizeChoices, shuffleFirsts } from './AssignmentUtils'

/**
 * @returns Record<username, moduleCode[]>
 */
export async function assign(phaseId: number) {
  const phase = await prisma.enrollphase.findUnique({
    where: { id: phaseId },
  })
  if (!phase) {
    throw new Error()
  }

  const offeredCourses = (
    await prisma.offeredCourse.findMany({
      select: {
        Course: { select: { creditPoints: true, title: true } },
        maxParticipants: true,
        minParticipants: true,
        moduleCode: true,
      },
      where: { phaseId },
    })
  ).map((e) => ({ ...e, studentCount: 0 }))
  const normalized = normalizeChoices(
    await prisma.studentPhase.findMany({
      include: { StudentChoice: true },
      where: { phaseId },
    }),
  )
  const allStudents = normalized.map(
    (e) => new AssignmentStudentController(e, offeredCourses),
  )

  let students = allStudents
  while (students.length) {
    students = shuffleFirsts(
      students.sort(
        (a, b) =>
          (b.choices.at(0)?.points ?? 0) - (a.choices.at(0)?.points ?? 0),
      ),
    )
    const student = students[0]
    const choice = student.choices[0]
    student.gainCourse(choice.moduleCode)
    const course = offeredCourses.find(
      (e) => e.moduleCode === choice.moduleCode,
    )
    if (!course) {
      throw new Error(
        `Course ${choice.moduleCode} not found in phase ${phaseId}`,
      )
    }
    course.studentCount++
    if (
      course.studentCount >= (course.maxParticipants ?? Number.MAX_SAFE_INTEGER)
    ) {
      students.forEach((e) => e.looseCourse(choice.moduleCode))
    }
    students = students.filter((e) => !e.isFinished())
  }
  return Object.fromEntries(
    allStudents.map(
      (e) => [e.username, e.gained.map((e) => e.moduleCode)] as const,
    ),
  )
}
