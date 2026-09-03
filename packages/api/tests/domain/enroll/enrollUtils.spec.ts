import '../../setup/env.ts'

import type { Student } from '../../../src/generated/prisma/client.js'
import type { ClientUser } from '../../../src/prisma/PrismaTypes.ts'

import { describe, expect, it } from 'vitest'

import {
  enrichUserWithMayEnroll,
  mayEnroll,
} from '../../../src/domain/enroll/enrollUtils.ts'
import { prismaMock } from '../../setup/prisma.ts'

describe('mayEnroll', () => {
  const baseStudent: Student = {
    faculty: 'Informatik',
    fieldOfStudy: 'Informatik (Bachelor)',
    finalDegree: 'Bachelor',
    regNumber: '123456',
    term: 1,
    username: 'teststudent',
  }

  const baseUser: ClientUser & { Student: Student } = {
    auth: {},
    email: 'test.student@tha.de',
    lastActive: new Date(),
    name: 'Test Student',
    otp: null,
    Student: baseStudent,
    type: 'Student',
    username: 'teststudent',
  }

  it('returns false for user without Student property', () => {
    // @ts-expect-error testing invalid user
    expect(mayEnroll({ ...baseUser, Student: null })).toBe(false)
  })

  it('allows enrollment if student email is in allowedEmails whitelist (case-insensitive)', () => {
    const user = {
      ...baseUser,
      email: 'Test.Student@tha.de',
      Student: { ...baseStudent, term: 1 },
    }
    expect(mayEnroll(user, ['other@tha.de', 'test.student@tha.de'])).toBe(true)
  })

  it('allows enrollment for Master students regardless of term', () => {
    const user = {
      ...baseUser,
      Student: { ...baseStudent, finalDegree: 'Master' as const, term: 1 },
    }
    expect(mayEnroll(user)).toBe(true)
  })

  it('allows enrollment for Systems Engineering (Bachelor) regardless of term', () => {
    const user = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Systems Engineering (Bachelor)',
        term: 1,
      },
    }
    expect(mayEnroll(user)).toBe(true)
  })

  it('allows enrollment for Informatik / Wirtschaftsinformatik from term 2 onwards', () => {
    const term1CS = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 1,
      },
    }
    const term2CS = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Informatik (Bachelor)',
        term: 2,
      },
    }
    const term2WI = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Wirtschaftsinformatik (Bachelor)',
        term: 2,
      },
    }

    expect(mayEnroll(term1CS)).toBe(false)
    expect(mayEnroll(term2CS)).toBe(true)
    expect(mayEnroll(term2WI)).toBe(true)
  })

  it('allows enrollment for other Bachelor programs only from term > 2', () => {
    const term2TI = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Technische Informatik (Bachelor)',
        term: 2,
      },
    }
    const term3TI = {
      ...baseUser,
      Student: {
        ...baseStudent,
        fieldOfStudy: 'Technische Informatik (Bachelor)',
        term: 3,
      },
    }

    expect(mayEnroll(term2TI)).toBe(false)
    expect(mayEnroll(term3TI)).toBe(true)
  })
})

describe('enrichUserWithMayEnroll', () => {
  const baseStudent: Student = {
    faculty: 'Informatik',
    fieldOfStudy: 'Informatik (Bachelor)',
    finalDegree: 'Bachelor',
    regNumber: '123456',
    term: 1,
    username: 'teststudent',
  }

  const baseUser: ClientUser & { Student: Student } = {
    auth: {},
    email: 'test.student@tha.de',
    lastActive: new Date(),
    name: 'Test Student',
    otp: null,
    Student: baseStudent,
    type: 'Student',
    username: 'teststudent',
  }

  it('returns user untouched if not a student', async () => {
    const userWithoutStudent = {
      auth: {},
      email: 'prof@tha.de',
      lastActive: new Date(),
      name: 'Prof',
      otp: null,
      Student: null,
      type: 'Professor' as const,
      username: 'prof',
    }
    const res = await enrichUserWithMayEnroll(userWithoutStudent)
    expect(res).toEqual(userWithoutStudent)
  })

  it('attaches mayEnroll boolean to Student', async () => {
    prismaMock.appConf.findFirst.mockResolvedValue({
      allowedEnrollmentEmails: ['test.student@tha.de'],
      hasMinFocuses: false,
      id: 'Instance',
      mailReceivers: [],
      maxCredits: 30,
      moduleBookLastUpdated: new Date(),
    })

    const res = await enrichUserWithMayEnroll(baseUser)
    expect(res.Student?.mayEnroll).toBe(true)
  })
})
