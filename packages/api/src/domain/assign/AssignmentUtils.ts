import type { StudentChoice, StudentPhase } from '@prisma/client'

import { range, shuffle, sumBy } from 'lodash-es'

import type { AssignmentStudentController } from './AssignmentControllers'

export function shuffleFirsts(students: AssignmentStudentController[]) {
  if (students.length <= 1) {
    return students
  }
  const maxPoints = students[0].choices[0].points
  for (let i = 1; i < students.length; i++) {
    if (students.at(i)?.choices[0]?.points !== maxPoints) {
      // shuffle up to i
      shuffle(range(i - 1)).forEach((newI, oldI) => {
        swap(newI, oldI)
      })
      break
    }
  }

  return students

  function swap(newI: number, oldI: number) {
    const tmp = students[newI]
    students[newI] = students[oldI]
    students[oldI] = tmp
  }
}

export function normalizeChoices(
  phase: ({ StudentChoice: StudentChoice[] } & StudentPhase)[],
) {
  return phase.map((student) => {
    const totalPoints = sumBy(student.StudentChoice, (e) => e.points)
    const scale = 1000 / totalPoints
    return {
      ...student,
      StudentChoice: student.StudentChoice.map((choice) => ({
        ...choice,
        points: Math.round(choice.points * scale),
      })),
    }
  })
}
