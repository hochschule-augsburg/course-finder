import { sumBy } from 'lodash-es'

import type { StudentChoice } from '../../generated/prisma/client.js'
import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes.ts'

import { coursesConflict } from './CourseConflicts.ts'

export type StudentPhaseWithChoices = {
  creditsNeeded: number
  StudentChoice: StudentChoice[]
  username: string
}

export class AssignmentStudentController {
  public readonly choices: StudentChoice[]
  public readonly creditsNeeded: number
  public readonly gained: StudentChoice[] = []
  public readonly lost: StudentChoice[] = []
  public readonly username: string
  private readonly offeredCourses: {
    appointments: CourseAppointmentsJson<string>
    Course: { creditPoints: number }
    moduleCode: string
  }[]

  constructor(
    student: StudentPhaseWithChoices,
    offeredCourses: {
      appointments: CourseAppointmentsJson<string>
      Course: { creditPoints: number }
      moduleCode: string
    }[],
  ) {
    this.username = student.username
    this.creditsNeeded = student.creditsNeeded
    this.offeredCourses = offeredCourses
    this.choices = student.StudentChoice.toSorted((a, b) => b.points - a.points)
  }

  courseCanceled(moduleCode: string) {
    const gainedIndex = this.gained.findIndex(
      (e) => e.moduleCode === moduleCode,
    )
    const choiceIndex = this.choices.findIndex(
      (e) => e.moduleCode === moduleCode,
    )
    if (choiceIndex !== -1) {
      this.choices.splice(choiceIndex, 1)
      this.choices.sort((a, b) => b.points - a.points)
    } else if (gainedIndex !== -1) {
      const choice = this.gained[gainedIndex]
      this.gained.splice(gainedIndex, 1)
      this.lost.push(choice)
    }
  }

  gainCourse(moduleCode: string) {
    const choiceIndex = this.choices.findIndex(
      (e) => e.moduleCode === moduleCode,
    )
    if (choiceIndex !== -1) {
      const choice = this.choices[choiceIndex]
      this.choices.splice(choiceIndex, 1)
      this.gained.push(choice)
      const conflictedChoices: StudentChoice[] = []
      for (let i = this.choices.length - 1; i >= 0; i--) {
        if (this.conflictsWithGained(this.choices[i].moduleCode)) {
          conflictedChoices.push(...this.choices.splice(i, 1))
        }
      }
      if (conflictedChoices.length) {
        this.lost.push(...conflictedChoices)
        this.redistributePoints(sumBy(conflictedChoices, (e) => e.points))
      }
    }
  }

  private conflictsWithGained(moduleCode: string) {
    const course = this.offeredCourses.find((e) => e.moduleCode === moduleCode)
    if (!course) {
      throw new Error(`Course ${moduleCode} not found in phase`)
    }
    return this.gained.some((choice) => {
      const gainedCourse = this.offeredCourses.find(
        (e) => e.moduleCode === choice.moduleCode,
      )
      if (!gainedCourse) {
        throw new Error(`Course ${choice.moduleCode} not found in phase`)
      }
      return coursesConflict(course.appointments, gainedCourse.appointments)
    })
  }

  private redistributePoints(points: number) {
    if (!this.choices.length) {
      return
    }
    this.choices.sort((a, b) => b.points - a.points)
    const pointsPerChoice = Math.floor(points / this.choices.length)
    this.choices.forEach((choice) => (choice.points += pointsPerChoice))
    this.choices[0].points += points % this.choices.length
    this.choices.sort((a, b) => b.points - a.points)
  }

  isFinished() {
    return (
      !this.choices.length ||
      sumBy(
        this.gained,
        (e) =>
          this.offeredCourses.find((j) => j.moduleCode === e.moduleCode)?.Course
            .creditPoints ?? 0,
      ) >= this.creditsNeeded
    )
  }

  looseCourse(moduleCode: string) {
    const choiceIndex = this.choices.findIndex(
      (e) => e.moduleCode === moduleCode,
    )
    if (choiceIndex !== -1) {
      const choice = this.choices[choiceIndex]
      this.choices.splice(choiceIndex, 1)
      this.lost.push(choice)
      this.redistributePoints(choice.points)
    }
  }
}
