import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import {
  seedAppConf,
  seedCourse,
  seedOfferedCourse,
  seedPhase,
  seedPhaseAssignment,
  seedStudent,
} from '../harness/factories.ts'
import {
  createMockFastifyReply,
  createPublicCaller,
  createStudentCaller,
} from '../harness/testClient.ts'
import { cleanDatabase, disconnectDatabase, prisma } from '../harness/testDb.ts'

describe('End-to-End Student Journey (student.md §1 - §4)', () => {
  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf({ maxCredits: 25 })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it('should successfully execute the complete student lifecycle across all phases', async () => {
    // -------------------------------------------------------------------------
    // Step 1: User Account & Authentication (§1.4)
    // -------------------------------------------------------------------------
    const { password, student, user } = await seedStudent({
      fieldOfStudy: 'Informatik (Bachelor)',
      password: 'MySecretPassword2026!',
      term: 3,
      username: 'journeyStudent',
    })

    const replyRecorder = createMockFastifyReply()
    const publicCaller = createPublicCaller(replyRecorder)

    const loginResult = await publicCaller.auth.login({
      password,
      username: user.username,
    })
    expect(typeof loginResult).toBe('object')
    if (typeof loginResult === 'object') {
      expect(loginResult.username).toBe('journeyStudent')
      expect(loginResult.Student?.mayEnroll).toBe(true)
    }

    const studentCaller = createStudentCaller(
      { ...user, Student: student },
      replyRecorder,
    )

    // -------------------------------------------------------------------------
    // Step 2: Course Discovery & Information Browsing (§2, §3.1)
    // -------------------------------------------------------------------------
    await seedCourse({
      creditPoints: 5,
      moduleCode: 'ML_COURSE',
      pdf: Buffer.from('%PDF Machine Learning Syllabus'),
      published: true,
      semesterHours: 4,
      title: { de: 'Maschinelles Lernen', en: 'Machine Learning' },
    })
    await seedCourse({
      creditPoints: 5,
      moduleCode: 'CLOUD_COURSE',
      published: true,
      semesterHours: 4,
      title: { de: 'Cloud Computing', en: 'Cloud Computing' },
    })
    await seedCourse({
      creditPoints: 5,
      moduleCode: 'FALLBACK_COURSE',
      published: true,
      semesterHours: 4,
      title: { de: 'Grundlagen Seminar', en: 'Basic Seminar' },
    })

    const allCourses = await publicCaller.course.getCourses()
    expect(allCourses.length).toBeGreaterThanOrEqual(3)

    const pdfData = await publicCaller.course.getPdf({
      moduleCode: 'ML_COURSE',
    })
    expect(pdfData.pdf).toBeInstanceOf(Int8Array)

    // -------------------------------------------------------------------------
    // Step 3: Phase Created but NOT_STARTED (§3)
    // -------------------------------------------------------------------------
    const phase = await seedPhase('NOT_STARTED')
    await seedOfferedCourse(phase.id, 'ML_COURSE', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phase.id, 'CLOUD_COURSE', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phase.id, 'FALLBACK_COURSE', {
      for: ['Informatik (Bachelor)'],
    })

    // No active phase detected yet
    expect(await studentCaller.course.getCurrentPhase()).toBeNull()

    // Registration attempt rejected
    await expect(() =>
      studentCaller.enroll.bulk({
        creditsNeeded: 10,
        data: [{ moduleCode: 'ML_COURSE', points: 100 }],
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    // -------------------------------------------------------------------------
    // Step 4: Phase Transitions to OPEN - Registration & Prioritization (§3.2)
    // -------------------------------------------------------------------------
    await prisma.enrollphase.update({
      data: { state: 'OPEN' },
      where: { id: phase.id },
    })

    const activePhase = await studentCaller.course.getCurrentPhase()
    expect(activePhase?.id).toBe(phase.id)

    const offeredCourses = await studentCaller.course.getOfferedCourses({
      phaseId: phase.id,
    })
    expect(offeredCourses).toHaveLength(3)

    // Student selects and prioritizes 3 subjects (Section 3.2: 50 + 49 + 1)
    await studentCaller.enroll.bulk({
      creditsNeeded: 10,
      data: [
        { moduleCode: 'ML_COURSE', points: 50 }, // Priority 1
        { moduleCode: 'CLOUD_COURSE', points: 49 }, // Priority 2
        { moduleCode: 'FALLBACK_COURSE', points: 1 }, // Fallback elective
      ],
      phaseId: phase.id,
    })

    let currentChoices = await studentCaller.enroll.list({ phaseId: phase.id })
    expect(currentChoices.choices).toHaveLength(3)
    expect(currentChoices.creditsNeeded).toBe(10)

    // -------------------------------------------------------------------------
    // Step 5: Changes & Withdrawals (§3.3)
    // -------------------------------------------------------------------------
    // Student decides to drop CLOUD_COURSE
    await studentCaller.enroll.delete({
      moduleCode: 'CLOUD_COURSE',
      phaseId: phase.id,
    })

    // Student redistributes points to remaining: 99 for ML_COURSE, 1 for FALLBACK_COURSE
    await studentCaller.enroll.bulk({
      creditsNeeded: 5,
      data: [
        { moduleCode: 'ML_COURSE', points: 99 },
        { moduleCode: 'FALLBACK_COURSE', points: 1 },
      ],
      phaseId: phase.id,
    })

    currentChoices = await studentCaller.enroll.list({ phaseId: phase.id })
    expect(currentChoices.choices).toHaveLength(2)
    expect(
      currentChoices.choices.find((c) => c.moduleCode === 'ML_COURSE')?.points,
    ).toBe(99)
    expect(
      currentChoices.choices.find((c) => c.moduleCode === 'FALLBACK_COURSE')
        ?.points,
    ).toBe(1)

    // -------------------------------------------------------------------------
    // Step 6: Phase Deadline Reached (Transitions to CLOSED)
    // -------------------------------------------------------------------------
    await prisma.enrollphase.update({
      data: { state: 'CLOSED' },
      where: { id: phase.id },
    })

    // Choices can still be viewed
    const choicesAfterClose = await studentCaller.enroll.list({
      phaseId: phase.id,
    })
    expect(choicesAfterClose.choices).toHaveLength(2)

    // Further modifications are locked
    await expect(() =>
      studentCaller.enroll.delete({
        moduleCode: 'FALLBACK_COURSE',
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    // -------------------------------------------------------------------------
    // Step 7: Allocation Algorithm Run (Transitions to DRAWING)
    // -------------------------------------------------------------------------
    await prisma.enrollphase.update({
      data: { state: 'DRAWING' },
      where: { id: phase.id },
    })

    // Algorithm assigns ML_COURSE (tryNo = 0)
    await seedPhaseAssignment(phase.id, 0, user.username, 'ML_COURSE')

    // Before publication, results remain unpublished (Section 4)
    expect(await studentCaller.assign.list()).toEqual([])

    // -------------------------------------------------------------------------
    // Step 8: Results Published (Transitions to FINISHED, publishedTry = 0) (§4)
    // -------------------------------------------------------------------------
    await prisma.enrollphase.update({
      data: { publishedTry: 0, state: 'FINISHED' },
      where: { id: phase.id },
    })

    const finalResults = await studentCaller.assign.list()
    expect(finalResults).toHaveLength(1)
    expect(finalResults[0].phaseId).toBe(phase.id)

    // Won courses
    expect(finalResults[0].assignments).toEqual([
      { moduleCode: 'ML_COURSE', points: 99 },
    ])

    // Lost courses
    expect(finalResults[0].lost).toEqual([
      { moduleCode: 'FALLBACK_COURSE', points: 1 },
    ])

    // -------------------------------------------------------------------------
    // Step 9: Logout (§1.5)
    // -------------------------------------------------------------------------
    await studentCaller.auth.logout()
    expect(replyRecorder.clearCookieMock).toHaveBeenCalledWith(
      'cf-token',
      expect.anything(),
    )
  })
})
