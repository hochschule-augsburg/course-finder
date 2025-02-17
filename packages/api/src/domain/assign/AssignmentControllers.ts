import type { StudentChoice, StudentPhase } from '@prisma/client'

import { sumBy } from 'lodash-es'

export class AssignmentStudentController {
  public readonly choices: StudentChoice[]
  public readonly gained: StudentChoice[] = []
  public readonly lost: StudentChoice[] = []

  constructor(
    private readonly phase: { StudentChoice: StudentChoice[] } & StudentPhase,
    private readonly offeredCourses: {
      Course: { creditPoints: number }
      moduleCode: string
    }[],
  ) {
    this.choices = phase.StudentChoice.toSorted((a, b) => b.points - a.points)
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
    }
  }

  isFinished() {
    return (
      !this.choices.length ||
      sumBy(
        this.gained,
        (e) =>
          this.offeredCourses.find((j) => j.moduleCode === e.moduleCode)?.Course
            .creditPoints ?? 0,
      ) >= this.phase.creditsNeeded
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
      if (!this.choices.length) {
        return
      }
      const compensation = choice.points / this.choices.length
      const floorComp = Math.floor(compensation)
      this.choices.sort((a, b) => b.points - a.points)
      this.choices.forEach((e) => (e.points = e.points + floorComp))
      this.choices[0].points += compensation === floorComp ? 0 : 1
    }
  }

  get username() {
    return this.phase.username
  }
}
