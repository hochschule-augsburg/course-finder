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

describe('Phase State Transitions & Permissions Matrix (student.md §3, §4)', () => {
  beforeEach(async () => {
    await cleanDatabase()
    await seedAppConf()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  it('should enforce state restrictions across all phase states (NOT_STARTED, OPEN, CLOSED, DRAWING, FINISHED)', async () => {
    const student = await seedStudent({
      fieldOfStudy: 'Informatik (Bachelor)',
      term: 3,
      username: 'stateStudent',
    })
    const caller = createStudentCaller({
      ...student.user,
      Student: student.student,
    })

    await seedCourse({ moduleCode: 'COURSE1', published: true })
    const phase = await seedPhase('NOT_STARTED')
    await seedOfferedCourse(phase.id, 'COURSE1', {
      for: ['Informatik (Bachelor)'],
    })

    // ==========================================
    // 1. STATE: NOT_STARTED
    // ==========================================
    let currentPhase = await caller.course.getCurrentPhase()
    expect(currentPhase).toBeNull()

    // Mutations must fail with "phase not active"
    await expect(() =>
      caller.enroll.upsert({
        moduleCode: 'COURSE1',
        phaseId: phase.id,
        points: 100,
      }),
    ).rejects.toThrowError('phase not active')

    await expect(() =>
      caller.enroll.bulk({
        creditsNeeded: 5,
        data: [{ moduleCode: 'COURSE1', points: 100 }],
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    await expect(() =>
      caller.enroll.delete({
        moduleCode: 'COURSE1',
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    let assignments = await caller.assign.list()
    expect(assignments).toEqual([])

    // ==========================================
    // 2. STATE TRANSITION: NOT_STARTED -> OPEN
    // ==========================================
    await prisma.enrollphase.update({
      data: { state: 'OPEN' },
      where: { id: phase.id },
    })

    currentPhase = await caller.course.getCurrentPhase()
    expect(currentPhase?.state).toBe('OPEN')

    // Mutations must now succeed
    await caller.enroll.bulk({
      creditsNeeded: 5,
      data: [{ moduleCode: 'COURSE1', points: 100 }],
      phaseId: phase.id,
    })

    const choices = await caller.enroll.list({ phaseId: phase.id })
    expect(choices.choices).toHaveLength(1)
    expect(choices.choices[0].moduleCode).toBe('COURSE1')

    // Results not yet available during open registration
    assignments = await caller.assign.list()
    expect(assignments).toEqual([])

    // ==========================================
    // 3. STATE TRANSITION: OPEN -> CLOSED
    // ==========================================
    await prisma.enrollphase.update({
      data: { state: 'CLOSED' },
      where: { id: phase.id },
    })

    currentPhase = await caller.course.getCurrentPhase()
    expect(currentPhase?.state).toBe('CLOSED')

    // Existing choices can be read (read-only)
    const closedChoices = await caller.enroll.list({ phaseId: phase.id })
    expect(closedChoices.choices).toHaveLength(1)

    // Mutations must now be blocked
    await expect(() =>
      caller.enroll.upsert({
        moduleCode: 'COURSE1',
        phaseId: phase.id,
        points: 50,
      }),
    ).rejects.toThrowError('phase not active')

    await expect(() =>
      caller.enroll.bulk({
        creditsNeeded: 5,
        data: [{ moduleCode: 'COURSE1', points: 100 }],
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    await expect(() =>
      caller.enroll.delete({
        moduleCode: 'COURSE1',
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    // ==========================================
    // 4. STATE TRANSITION: CLOSED -> DRAWING
    // ==========================================
    await prisma.enrollphase.update({
      data: { state: 'DRAWING' },
      where: { id: phase.id },
    })

    currentPhase = await caller.course.getCurrentPhase()
    expect(currentPhase?.state).toBe('DRAWING')

    await expect(() =>
      caller.enroll.bulk({
        creditsNeeded: 5,
        data: [{ moduleCode: 'COURSE1', points: 100 }],
        phaseId: phase.id,
      }),
    ).rejects.toThrowError('phase not active')

    // Even if algorithm has generated assignments in DB, student cannot see them before publish
    await seedPhaseAssignment(phase.id, 0, student.user.username, 'COURSE1')
    assignments = await caller.assign.list()
    expect(assignments).toEqual([]) // publishedTry is still null!

    // ==========================================
    // 5. STATE TRANSITION: DRAWING -> FINISHED (Published)
    // ==========================================
    await prisma.enrollphase.update({
      data: { publishedTry: 0, state: 'FINISHED' },
      where: { id: phase.id },
    })

    currentPhase = await caller.course.getCurrentPhase()
    expect(currentPhase).toBeNull() // FINISHED is not in ['OPEN', 'CLOSED', 'DRAWING']

    // Student calls assign.list and now receives the published result
    assignments = await caller.assign.list()
    expect(assignments).toHaveLength(1)
    expect(assignments[0].phaseId).toBe(phase.id)
    expect(assignments[0].assignments).toEqual([
      { moduleCode: 'COURSE1', points: 100 },
    ])
    expect(assignments[0].lost).toEqual([])
  })
})
