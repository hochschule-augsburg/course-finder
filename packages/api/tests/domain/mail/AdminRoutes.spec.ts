import type { User } from '@prisma/client'

import {
  testConstructTxtText,
  testGetStudentEmails,
} from '../../../src/routes/admin/assign/AssignRoutes'
import { prismaMock } from '../../setup/prisma'

const assignmentResults = {
  stud1: [{ moduleCode: 'course a' }, { moduleCode: 'course b' }],
  stud2: [{ moduleCode: 'course a' }, { moduleCode: 'course c' }],
  stud3: [{ moduleCode: 'course b' }, { moduleCode: 'course c' }],
}

const userMock: User[] = [
  {
    auth: {
      method: 'local' as const,
      password: 'stud1',
      salt: 'salt',
    },
    email: 'stud1@example.com',
    name: 'stud 1',
    otp: null,
    type: 'Student',
    username: 'stud1',
  },
  {
    auth: {
      method: 'local' as const,
      password: 'stud2',
      salt: 'salt',
    },
    email: 'stud2@example.com',
    name: 'stud 2',
    otp: null,
    type: 'Student',
    username: 'stud2',
  },
  {
    auth: {
      method: 'local' as const,
      password: 'stud3',
      salt: 'salt',
    },
    email: 'stud3@example.com',
    name: 'stud 3',
    otp: null,
    type: 'Student',
    username: 'stud3',
  },
]

describe('testGetStudentEmails', () => {
  it('collects students that signed up for wpfs and returns their emails', async () => {
    prismaMock.user.findMany.mockResolvedValue(userMock)
    const emails = Object.values(
      await testGetStudentEmails.getStudentEmails(assignmentResults),
    )
    expect(emails).toContain('stud1@example.com')
    expect(emails).toContain('stud2@example.com')
    expect(emails).toContain('stud3@example.com')
    assert(emails.length === 3)
  })
})

describe('testConstructTxtText', () => {
  it('creates a list of every unique modulecode and student-modules allocation', () => {
    expect(testConstructTxtText.constructTxtText(assignmentResults)).toBe(
      'Stattfindende Module\n\ncourse a\ncourse b\ncourse c\n\nStudent-Modulcode Zuweisungen\n\nstud1: course a, course b, \nstud2: course a, course c, \nstud3: course b, course c, \n',
    )
  })
})
