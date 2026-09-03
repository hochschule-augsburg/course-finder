import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import {
  seedAppConf,
  seedCourse,
  seedOfferedCourse,
  seedPhase,
  seedPhaseAssignment,
  seedStudent,
} from '../harness/factories.ts'
import { createStudentCaller } from '../harness/testClient.ts'
import { cleanDatabase, disconnectDatabase, prisma } from '../harness/testDb.ts'

describe('Assignment Results & Allocation View (student.md §4)', () => {
  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it('should return empty list when phase has not published allocation try', async () => {
    const student = await seedStudent({ username: 'assignStudent1' })
    const caller = createStudentCaller({
      ...student.user,
      Student: student.student,
    })

    const phase = await seedPhase('OPEN', { publishedTry: null })
    await seedCourse({ moduleCode: 'COURSE_A', published: true })
    await seedOfferedCourse(phase.id, 'COURSE_A', {
      for: ['Informatik (Bachelor)'],
    })

    await caller.enroll.bulk({
      creditsNeeded: 5,
      data: [{ moduleCode: 'COURSE_A', points: 100 }],
      phaseId: phase.id,
    })

    const results = await caller.assign.list()
    expect(results).toEqual([])
  })

  it('should accurately partition choices into assignments and lost courses sorted by points', async () => {
    const student = await seedStudent({ username: 'assignStudent2' })
    const caller = createStudentCaller({
      ...student.user,
      Student: student.student,
    })

    const phase = await seedPhase('OPEN')
    await seedCourse({ moduleCode: 'COURSE_WON_HIGH', published: true })
    await seedCourse({ moduleCode: 'COURSE_WON_LOW', published: true })
    await seedCourse({ moduleCode: 'COURSE_LOST', published: true })

    await seedOfferedCourse(phase.id, 'COURSE_WON_HIGH', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phase.id, 'COURSE_WON_LOW', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phase.id, 'COURSE_LOST', {
      for: ['Informatik (Bachelor)'],
    })

    // Student selects 3 courses with points
    await caller.enroll.bulk({
      creditsNeeded: 10,
      data: [
        { moduleCode: 'COURSE_WON_HIGH', points: 60 },
        { moduleCode: 'COURSE_WON_LOW', points: 10 },
        { moduleCode: 'COURSE_LOST', points: 30 },
      ],
      phaseId: phase.id,
    })

    // Simulate allocation try 1
    const tryNo = 1
    await seedPhaseAssignment(
      phase.id,
      tryNo,
      student.user.username,
      'COURSE_WON_HIGH',
    )
    await seedPhaseAssignment(
      phase.id,
      tryNo,
      student.user.username,
      'COURSE_WON_LOW',
    )

    // Publish try 1
    await prisma.enrollphase.update({
      data: { publishedTry: tryNo, state: 'FINISHED' },
      where: { id: phase.id },
    })

    const results = await caller.assign.list()
    expect(results).toHaveLength(1)

    const phaseResult = results[0]
    expect(phaseResult.phaseId).toBe(phase.id)

    // Verify won assignments (sorted by points ascending: 10 then 60)
    expect(phaseResult.assignments).toEqual([
      { moduleCode: 'COURSE_WON_LOW', points: 10 },
      { moduleCode: 'COURSE_WON_HIGH', points: 60 },
    ])

    // Verify lost courses (sorted by points: 30)
    expect(phaseResult.lost).toEqual([
      { moduleCode: 'COURSE_LOST', points: 30 },
    ])
  })

  it('should strictly return assignments matching publishedTry when multiple runs exist', async () => {
    const student = await seedStudent({ username: 'assignStudent3' })
    const caller = createStudentCaller({
      ...student.user,
      Student: student.student,
    })

    const phase = await seedPhase('OPEN')
    await seedCourse({ moduleCode: 'COURSE_TRY0', published: true })
    await seedCourse({ moduleCode: 'COURSE_TRY1', published: true })

    await seedOfferedCourse(phase.id, 'COURSE_TRY0', {
      for: ['Informatik (Bachelor)'],
    })
    await seedOfferedCourse(phase.id, 'COURSE_TRY1', {
      for: ['Informatik (Bachelor)'],
    })

    await caller.enroll.bulk({
      creditsNeeded: 5,
      data: [
        { moduleCode: 'COURSE_TRY0', points: 50 },
        { moduleCode: 'COURSE_TRY1', points: 50 },
      ],
      phaseId: phase.id,
    })

    // Draft / trial run 0: gave COURSE_TRY0
    await seedPhaseAssignment(phase.id, 0, student.user.username, 'COURSE_TRY0')

    // Final run 1: gave COURSE_TRY1
    await seedPhaseAssignment(phase.id, 1, student.user.username, 'COURSE_TRY1')

    // Publish run 1
    await prisma.enrollphase.update({
      data: { publishedTry: 1, state: 'FINISHED' },
      where: { id: phase.id },
    })

    const results = await caller.assign.list()
    expect(results).toHaveLength(1)
    expect(results[0].assignments).toEqual([
      { moduleCode: 'COURSE_TRY1', points: 50 },
    ])
    expect(results[0].lost).toEqual([{ moduleCode: 'COURSE_TRY0', points: 50 }])
  })
})
