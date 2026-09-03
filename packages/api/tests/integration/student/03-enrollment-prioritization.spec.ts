import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import {
  seedAppConf,
  seedCourse,
  seedOfferedCourse,
  seedPhase,
  seedStudent,
} from '../harness/factories.ts'
import { createStudentCaller } from '../harness/testClient.ts'
import { cleanDatabase, disconnectDatabase, prisma } from '../harness/testDb.ts'

describe('Enrollment Prioritization & Changes (student.md §3.2, §3.3)', () => {
  let phaseId: number

  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf({ maxCredits: 20 })

    const phase = await seedPhase('OPEN')
    phaseId = phase.id

    // Seed test courses
    await seedCourse({ moduleCode: 'CS101', published: true })
    await seedCourse({ moduleCode: 'CS102', published: true })
    await seedCourse({ moduleCode: 'CS103', published: true })
    await seedCourse({ moduleCode: 'EXT201', published: true })
    await seedCourse({ moduleCode: 'OTHER301', published: true })

    // Seed offered courses
    await seedOfferedCourse(phaseId, 'CS101', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phaseId, 'CS102', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phaseId, 'CS103', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phaseId, 'EXT201', {
      externalRegistration: true,
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phaseId, 'OTHER301', {
      for: ['Wirtschaftsinformatik (Bachelor)'],
    })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('Single Choice Upsert (enroll.upsert)', () => {
    it('should allow student to select and update points for an offered course', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'judy',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      await caller.enroll.upsert({
        creditsNeeded: 10,
        moduleCode: 'CS101',
        phaseId,
        points: 50,
      })

      const listResult = await caller.enroll.list({ phaseId })
      expect(listResult.creditsNeeded).toBe(10)
      expect(listResult.choices).toEqual([
        expect.objectContaining({ moduleCode: 'CS101', points: 50 }),
      ])

      // Update points and creditsNeeded
      await caller.enroll.upsert({
        creditsNeeded: 15,
        moduleCode: 'CS101',
        phaseId,
        points: 80,
      })

      const updated = await caller.enroll.list({ phaseId })
      expect(updated.creditsNeeded).toBe(15)
      expect(updated.choices[0].points).toBe(80)
    })

    it('should reject upsert for course not offered to student field of study', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'kevin',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      await expect(() =>
        caller.enroll.upsert({
          moduleCode: 'OTHER301',
          phaseId,
          points: 100,
        }),
      ).rejects.toThrowError('module not offered for you')
    })

    it('should reject upsert for course requiring external registration', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'laura',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      await expect(() =>
        caller.enroll.upsert({
          moduleCode: 'EXT201',
          phaseId,
          points: 100,
        }),
      ).rejects.toThrowError('module not offered for you')
    })

    it('should reject creditsNeeded exceeding maxCredits', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'mike',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      await expect(() =>
        caller.enroll.upsert({
          creditsNeeded: 25, // maxCredits is 20
          moduleCode: 'CS101',
          phaseId,
          points: 100,
        }),
      ).rejects.toThrowError('invalid credits needed')
    })
  })

  describe('Bulk Registration & Prioritization Schemes (enroll.bulk)', () => {
    it('should support Case 1: Equal distribution (50/50) among priority electives', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'nina',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      const result = await caller.enroll.bulk({
        creditsNeeded: 10,
        data: [
          { moduleCode: 'CS101', points: 50 },
          { moduleCode: 'CS102', points: 50 },
        ],
        phaseId,
      })

      expect(result.creditsNeeded).toBe(10)
      expect(result.choices).toHaveLength(2)
      expect(result.choices).toContainEqual({ moduleCode: 'CS101', points: 50 })
      expect(result.choices).toContainEqual({ moduleCode: 'CS102', points: 50 })
    })

    it('should support Case 2: Priority (99) and Fallback (1) Autofill distribution', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'oscar',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      const result = await caller.enroll.bulk({
        creditsNeeded: 5,
        data: [
          { moduleCode: 'CS101', points: 99 }, // Priority
          { moduleCode: 'CS102', points: 1 }, // Fallback
        ],
        phaseId,
      })

      expect(result.choices).toHaveLength(2)
      const p1 = result.choices.find((c) => c.moduleCode === 'CS101')
      const fallback = result.choices.find((c) => c.moduleCode === 'CS102')
      expect(p1?.points).toBe(99)
      expect(fallback?.points).toBe(1)
    })

    it('should replace previous choices atomically when calling bulk', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'paul',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      // First submission
      await caller.enroll.bulk({
        creditsNeeded: 5,
        data: [{ moduleCode: 'CS101', points: 100 }],
        phaseId,
      })

      // Second submission replaces CS101 with CS102 and CS103
      const updated = await caller.enroll.bulk({
        creditsNeeded: 10,
        data: [
          { moduleCode: 'CS102', points: 60 },
          { moduleCode: 'CS103', points: 40 },
        ],
        phaseId,
      })

      expect(updated.choices).toHaveLength(2)
      const codes = updated.choices.map((c) => c.moduleCode)
      expect(codes).not.toContain('CS101')
      expect(codes).toContain('CS102')
      expect(codes).toContain('CS103')

      // Verify in database directly
      const dbChoices = await prisma.studentChoice.findMany({
        where: { phaseId, username: 'paul' },
      })
      expect(dbChoices).toHaveLength(2)
    })
  })

  describe('Deselection & Changes (enroll.delete)', () => {
    it('should remove deselected course from student choices', async () => {
      const student = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 3,
        username: 'quinn',
      })
      const caller = createStudentCaller({
        ...student.user,
        Student: student.student,
      })

      await caller.enroll.bulk({
        creditsNeeded: 10,
        data: [
          { moduleCode: 'CS101', points: 50 },
          { moduleCode: 'CS102', points: 50 },
        ],
        phaseId,
      })

      // Deselect CS101
      await caller.enroll.delete({
        moduleCode: 'CS101',
        phaseId,
      })

      const remaining = await caller.enroll.list({ phaseId })
      expect(remaining.choices).toHaveLength(1)
      expect(remaining.choices[0].moduleCode).toBe('CS102')

      // Student rebalances points via bulk to make it 100 again
      await caller.enroll.bulk({
        creditsNeeded: remaining.creditsNeeded,
        data: [{ moduleCode: 'CS102', points: 100 }],
        phaseId,
      })

      const rebalanced = await caller.enroll.list({ phaseId })
      expect(rebalanced.choices[0].points).toBe(100)
    })
  })

  describe('Student Ineligibility Guard', () => {
    it('should reject enrollment mutations if student is ineligible', async () => {
      // Ineligible: Bachelor Term 1
      const ineligibleStudent = await seedStudent({
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 1,
        username: 'freshman',
      })
      const caller = createStudentCaller({
        ...ineligibleStudent.user,
        Student: ineligibleStudent.student,
      })

      await expect(() =>
        caller.enroll.upsert({
          moduleCode: 'CS101',
          phaseId,
          points: 100,
        }),
      ).rejects.toThrowError('student not eligible for enrollment')

      await expect(() =>
        caller.enroll.bulk({
          creditsNeeded: 5,
          data: [{ moduleCode: 'CS101', points: 100 }],
          phaseId,
        }),
      ).rejects.toThrowError('student not eligible for enrollment')
    })
  })
})
