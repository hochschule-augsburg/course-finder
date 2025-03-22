import type { OfferedCourse } from '@prisma/client'

import { prisma } from '../../prisma/prisma.ts'
import { AssignmentStudentController } from './AssignmentControllers.ts'
import { normalizeChoices, shuffleFirsts } from './AssignmentUtils.ts'

type AssignCourse = OfferedCourse & {
  studentCount: number
}

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

  const offeredCourses = await prisma.offeredCourse.findMany({
    include: {
      Course: { select: { creditPoints: true, title: true } },
    },
    where: { phaseId },
  })
  const assignCourses: AssignCourse[] = offeredCourses.map((e) => ({
    ...e,
    studentCount: 0,
  }))

  const normalized = normalizeChoices(
    await prisma.studentPhase.findMany({
      include: { StudentChoice: true },
      where: { phaseId },
    }),
  )
  const allStudents = normalized.map(
    (e) => new AssignmentStudentController(e, offeredCourses),
  )

  while (true) {
    assignStudents(allStudents, assignCourses)
    const canceled = assignCourses.findIndex(
      (e) => e.studentCount < e.minParticipants,
    )
    if (canceled === -1) {
      break
    }
    allStudents.forEach((e) =>
      e.courseCanceled(assignCourses[canceled].moduleCode),
    )
    assignCourses.splice(canceled, 1)
  }

  return Object.fromEntries(
    allStudents.map(
      (e) => [e.username, e.gained.map((e) => e.moduleCode)] as const,
    ),
  )
}

function assignStudents(
  allStudents: AssignmentStudentController[],
  assignCourses: AssignCourse[],
) {
  let students = allStudents
  students = students.filter((e) => !e.isFinished())
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
    const course = assignCourses.find((e) => e.moduleCode === choice.moduleCode)
    if (!course) {
      throw new Error(`Course ${choice.moduleCode} not found in phase`)
    }
    course.studentCount++
    if (
      course.studentCount >= (course.maxParticipants ?? Number.MAX_SAFE_INTEGER)
    ) {
      students.forEach((e) => e.looseCourse(choice.moduleCode))
    }
    students = students.filter((e) => !e.isFinished())
  }
}
