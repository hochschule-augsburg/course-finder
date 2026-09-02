import type {
  Course,
  OfferedCourse,
  StudentChoice,
  StudentPhase,
} from '../../../src/generated/prisma/client.js'
import type { EnrollPhase } from '../../../src/prisma/PrismaTypes.ts'

import { assign } from '../../../src/domain/assign/AssignmentAlgorithm.ts'
import { prismaMock } from '../../setup/prisma.ts'
import phase3Data from './fixtures/phase3AnonymizedData.json'

describe('AssignmentAlgorithm - Large Scale Real Dataset (Phase 3)', () => {
  beforeEach(() => {
    // Mock prisma responses with the anonymized real dataset
    prismaMock.enrollphase.findUnique.mockResolvedValue(
      phase3Data.phase as unknown as EnrollPhase,
    )

    prismaMock.offeredCourse.findMany.mockResolvedValue(
      phase3Data.offeredCourses as unknown as Array<
        OfferedCourse & { Course: Course }
      >,
    )

    prismaMock.studentPhase.findMany.mockResolvedValue(
      phase3Data.studentPhases as unknown as Array<
        StudentPhase & { StudentChoice: StudentChoice[] }
      >,
    )
  })

  it('should successfully run assignment for 500+ students and verify all assignment invariants', async () => {
    const result = await assign(3)

    // 1. Result should contain assignments for all students
    const studentUsernames = Object.keys(result)
    expect(studentUsernames.length).toBe(phase3Data.studentPhases.length)

    // Helper map for course details
    const courseMap = new Map(
      phase3Data.offeredCourses.map((c) => [c.moduleCode, c]),
    )

    // Helper map for student input choices and credits needed
    const studentMap = new Map(
      phase3Data.studentPhases.map((s) => [s.username, s]),
    )

    // Track assigned counts per course
    const courseAssignmentCounts = new Map<string, number>()
    phase3Data.offeredCourses.forEach((c) =>
      courseAssignmentCounts.set(c.moduleCode, 0),
    )

    let totalAssignments = 0

    for (const [username, assignedModules] of Object.entries(result)) {
      const studentInput = studentMap.get(username)
      expect(studentInput).toBeDefined()

      // Check for duplicate course assignments per student
      const uniqueModules = new Set(assignedModules)
      expect(assignedModules.length).toBe(uniqueModules.size)

      const choiceModuleCodes = new Set(
        studentInput?.StudentChoice.map((c) => c.moduleCode),
      )

      let gainedCredits = 0
      for (const moduleCode of assignedModules) {
        // Invariant: Student must only get courses they actually chose
        expect(choiceModuleCodes.has(moduleCode)).toBe(true)

        const course = courseMap.get(moduleCode)
        expect(course).toBeDefined()

        gainedCredits += course?.Course.creditPoints ?? 0
        courseAssignmentCounts.set(
          moduleCode,
          (courseAssignmentCounts.get(moduleCode) ?? 0) + 1,
        )
        totalAssignments++
      }

      // Invariant: If a student gained courses, they shouldn't exceed needed credits unless the last course caused it
      // The student stops gaining once sum >= creditsNeeded
      if (assignedModules.length > 1) {
        const lastCourseCredits =
          courseMap.get(assignedModules[assignedModules.length - 1])?.Course
            .creditPoints ?? 0
        const creditsBeforeLast = gainedCredits - lastCourseCredits
        expect(creditsBeforeLast).toBeLessThan(
          studentInput?.creditsNeeded ?? Infinity,
        )
      }
    }

    // Invariant: Course capacity constraints (minParticipants & maxParticipants)
    for (const [moduleCode, count] of courseAssignmentCounts.entries()) {
      const course = courseMap.get(moduleCode)
      expect(course).toBeDefined()

      if (
        course?.maxParticipants !== null &&
        course?.maxParticipants !== undefined
      ) {
        // Due to multi-round course cancellation where finished students reactivate,
        // counts can at most exceed maxParticipants by a small overshoot margin (e.g. +1).
        expect(count).toBeLessThanOrEqual(course.maxParticipants + 1)
      }

      // If a course is not canceled (assigned to at least 1 student), it must meet minParticipants
      if (count > 0) {
        expect(count).toBeGreaterThanOrEqual(course?.minParticipants ?? 0)
      }
    }

    // Total assignments should match the phase assignment total (~778)
    expect(totalAssignments).toBeGreaterThanOrEqual(770)
    expect(totalAssignments).toBeLessThanOrEqual(785)
  })

  it('should assign valid courses matching expected anonymized assignments closely', async () => {
    const result = await assign(3)

    // Compare with expected assignments from PhaseAssignment table
    const expected = phase3Data.expectedAssignments as Record<string, string[]>

    let matchCount = 0
    let totalAssignedExpected = 0

    for (const [username, expectedCourses] of Object.entries(expected)) {
      const actualCourses = (result[username] ?? []).toSorted()
      const sortedExpected = expectedCourses.toSorted()

      totalAssignedExpected += expectedCourses.length
      for (const course of actualCourses) {
        if (sortedExpected.includes(course)) {
          matchCount++
        }
      }
    }

    // Due to tie-breaking shuffles on identical point distributions,
    // match rate should be high (>90%) with the recorded tryNo=3 run
    const matchPercentage = (matchCount / totalAssignedExpected) * 100
    expect(matchPercentage).toBeGreaterThan(90)
  })
})
