import type { Course, OfferedCourse } from '@prisma/client'

import type { EnrollPhase } from '../../../src/prisma/PrismaTypes'

import { assign } from '../../../src/domain/assign/AssignmentAlgorithm'
import { prismaMock } from '../../setup/prisma'

describe('AssignmentAlgorithm', () => {
  it('should throw error if phase does not exist', async () => {
    prismaMock.enrollphase.findUnique.mockResolvedValue(null)
    expect(() => assign(1)).rejects.toThrowError()
  })

  it.each<
    [
      name: string,
      input: Array<{
        StudentChoice: Array<{ moduleCode: string; points: number }>
        creditsNeeded: number
        username: string
      }>,
      out: Record<string, string[]>,
    ]
  >([
    [
      'normal',
      [
        {
          StudentChoice: [{ moduleCode: '1', points: 1000 }],
          creditsNeeded: 6,
          username: 'user1',
        },
        {
          StudentChoice: [
            { moduleCode: '2', points: 500 },
            { moduleCode: '1', points: 500 },
            { moduleCode: '3', points: 500 },
          ],
          creditsNeeded: 3,
          username: 'user2',
        },
        {
          StudentChoice: [{ moduleCode: '1', points: 1000 }],
          creditsNeeded: 2,
          username: 'user3',
        },
        { StudentChoice: [], creditsNeeded: 10, username: 'user4' },
      ],
      {
        user1: ['1'],
        user2: ['2'],
        user3: [],
        user4: [],
      },
    ],
    [
      'not enough credits',
      [
        {
          StudentChoice: [{ moduleCode: '1', points: 1000 }],
          creditsNeeded: 6,
          username: 'user1',
        },
      ],
      {
        user1: ['1'],
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
