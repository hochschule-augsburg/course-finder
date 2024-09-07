import type { Course, OfferedCourse } from '@prisma/client'

import type { EnrollPhase } from '../../../src/prisma/PrismaTypes'

import { assign } from '../../../src/domain/assign/AssignmentAlgorithm'
import { prismaMock } from '../../setup/prisma'

describe('AssignmentAlgorithm', () => {
  it('should throw error if phase does not exist', async () => {
    prismaMock.enrollphase.findUnique.mockResolvedValue(null)
    await expect(() => assign(1)).rejects.toThrowError()
  })

  it.each<
    [
      name: string,
      input: Array<{
        creditsNeeded: number
        StudentChoice: Array<{ moduleCode: string; points: number }>
        username: string
      }>,
      out: Record<string, string[]>,
    ]
  >([
    ['no students', [], {}],
    [
      'no choice',
      [{ creditsNeeded: 0, StudentChoice: [], username: 'user1' }],
      { user1: [] },
    ],
    [
      'no points',
      [
        {
          creditsNeeded: 0,
          StudentChoice: [{ moduleCode: '3', points: 0 }],
          username: 'user1',
        },
      ],
      { user1: [] },
    ],
    [
      '2 for course',
      [
        {
          creditsNeeded: 3,
          StudentChoice: [{ moduleCode: '3', points: 1000 }],
          username: 'user1',
        },
        {
          creditsNeeded: 3,
          StudentChoice: [{ moduleCode: '3', points: 1000 }],
          username: 'user2',
        },
      ],
      {
        user1: ['3'],
        user2: ['3'],
      },
    ],
    [
      'not enough credits',
      [
        {
          creditsNeeded: 6,
          StudentChoice: [{ moduleCode: '1', points: 1000 }],
          username: 'user1',
        },
      ],
      {
        user1: ['1'],
      },
    ],
    [
      'course does not occur',
      [
        {
          creditsNeeded: 6,
          StudentChoice: [{ moduleCode: '1', points: 1000 }],
          username: 'user1',
        },
        {
          creditsNeeded: 6,
          StudentChoice: [{ moduleCode: '2', points: 1 }],
          username: 'user2',
        },
      ],
      {
        user1: ['1'],
        user2: [],
      },
    ],
  ])('should assign students to courses %s', async (_, input, output) => {
    prismaMock.enrollphase.findUnique.mockResolvedValue({} as EnrollPhase)
    // @ts-ignore
    prismaMock.offeredCourse.findMany.mockResolvedValue([
      { Course: { creditPoints: 3 }, maxParticipants: 1, moduleCode: '1' },
      { Course: { creditPoints: 3 }, minParticipants: 4, moduleCode: '2' },
      { Course: { creditPoints: 4 }, maxParticipants: 2, moduleCode: '3' },
      { Course: { creditPoints: 3 }, moduleCode: '4' },
      { Course: { creditPoints: 3 }, moduleCode: '5' },
    ] as Partial<{ Course: Course } & OfferedCourse>[])

    // @ts-ignore
    prismaMock.studentPhase.findMany.mockResolvedValue(input)

    expect(await assign(1)).toEqual(output)
  })
})
