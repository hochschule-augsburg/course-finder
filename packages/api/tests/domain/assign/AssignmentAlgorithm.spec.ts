import type {
  OfferedCourse,
  StudentChoice,
  StudentPhase,
} from '../../../src/generated/prisma/client.js'
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
    prismaMock.offeredCourse.findMany.mockResolvedValue(
      [
        { Course: { creditPoints: 3 }, maxParticipants: 1, moduleCode: '1' },
        { Course: { creditPoints: 3 }, minParticipants: 4, moduleCode: '2' },
        { Course: { creditPoints: 4 }, maxParticipants: 2, moduleCode: '3' },
        { Course: { creditPoints: 3 }, moduleCode: '4' },
        { Course: { creditPoints: 3 }, moduleCode: '5' },
      ].map((course) => ({
        appointments: { dates: [], type: 'weekly' },
        ...course,
      })) as never,
    )

    // @ts-ignore
    prismaMock.studentPhase.findMany.mockResolvedValue(input)

    expect(await assign(1)).toEqual(output)
  })

  it('reconsiders conflicting alternatives after a course is cancelled', async () => {
    prismaMock.enrollphase.findUnique.mockResolvedValue({} as EnrollPhase)
    prismaMock.offeredCourse.findMany.mockResolvedValue([
      {
        appointments: {
          dates: [{ from: '2026-01-05T10:00:00', to: '2026-01-05T12:00:00' }],
          type: 'weekly',
        },
        Course: { creditPoints: 3 },
        maxParticipants: null,
        minParticipants: 2,
        moduleCode: 'A',
      },
      {
        appointments: {
          dates: [{ from: '2026-01-05T11:00:00', to: '2026-01-05T13:00:00' }],
          type: 'weekly',
        },
        Course: { creditPoints: 3 },
        maxParticipants: null,
        minParticipants: 0,
        moduleCode: 'B',
      },
    ] as never)
    prismaMock.studentPhase.findMany.mockResolvedValue([
      {
        creditsNeeded: 3,
        StudentChoice: [
          { moduleCode: 'A', phaseId: 1, points: 99, username: 'user1' },
          { moduleCode: 'B', phaseId: 1, points: 1, username: 'user1' },
        ],
        username: 'user1',
      },
    ] as never)

    expect(await assign(1)).toEqual({ user1: ['B'] })
  })

  describe('time conflicts across assignment rounds', () => {
    function course(
      moduleCode: string,
      overrides: Partial<OfferedCourse> = {},
    ): OfferedCourse & {
      Course: { creditPoints: number; title: { en: string } }
    } {
      return {
        appointments: { dates: [], type: 'weekly' },
        Course: { creditPoints: 3, title: { en: moduleCode } },
        externalRegistration: false,
        extraInfo: null,
        for: [],
        hideMinParticipants: false,
        maxParticipants: 1,
        minParticipants: 0,
        moduleCode,
        moodleCourse: null,
        phaseId: 1,
        ...overrides,
      }
    }

    function student(
      username: string,
      choices: [string, number][],
    ): StudentPhase & { StudentChoice: StudentChoice[] } {
      return {
        createdAt: new Date('2026-01-01T00:00:00Z'),
        creditsNeeded: 6,
        phaseId: 1,
        StudentChoice: choices.map(([moduleCode, points]) => ({
          moduleCode,
          phaseId: 1,
          points,
          username,
        })),
        username,
      }
    }

    const appointments: OfferedCourse['appointments'] = {
      dates: [{ from: '2026-01-05T10:00:00', to: '2026-01-05T12:00:00' }],
      type: 'weekly',
    }

    beforeEach(() => {
      prismaMock.enrollphase.findUnique.mockResolvedValue({} as EnrollPhase)
    })

    it('uses redistributed conflict points to award a scarce seat without affecting other students', async () => {
      const courses = [
        course('A', { appointments }),
        course('B', { appointments, maxParticipants: 2 }),
        course('C'),
        course('D'),
        course('E'),
      ]
      const students = [
        student('user1', [
          ['A', 60],
          ['B', 30],
          ['C', 10],
        ]),
        student('user2', [
          ['D', 55],
          ['C', 35],
          ['E', 10],
        ]),
        student('user3', [['B', 100]]),
      ]
      prismaMock.offeredCourse.findMany.mockResolvedValue(courses)
      prismaMock.studentPhase.findMany.mockResolvedValue(students)

      const result = await assign(1)

      expect(result).toEqual({
        user1: ['A', 'C'],
        user2: ['D', 'E'],
        user3: ['B'],
      })
      for (const offered of courses) {
        const count = Object.values(result).filter((modules) =>
          modules.includes(offered.moduleCode),
        ).length
        expect(count).toBeLessThanOrEqual(
          offered.maxParticipants ?? Number.MAX_SAFE_INTEGER,
        )
      }
      expect(students[0].StudentChoice.map((choice) => choice.points)).toEqual([
        60, 30, 10,
      ])
    })

    it('returns only one course if all other choices conflict and credits are still missing', async () => {
      prismaMock.offeredCourse.findMany.mockResolvedValue([
        course('A', { appointments }),
        course('B', { appointments }),
        course('C', { appointments }),
      ])
      prismaMock.studentPhase.findMany.mockResolvedValue([
        student('user1', [
          ['A', 80],
          ['B', 15],
          ['C', 5],
        ]),
      ])

      expect(await assign(1)).toEqual({ user1: ['A'] })
    })

    it('restores an excluded fallback with its original points after cancellation', async () => {
      prismaMock.offeredCourse.findMany.mockResolvedValue([
        course('A', { appointments, maxParticipants: 2, minParticipants: 2 }),
        course('B', { appointments }),
        course('C'),
        course('D'),
      ])
      prismaMock.studentPhase.findMany.mockResolvedValue([
        student('user1', [
          ['A', 60],
          ['B', 30],
          ['C', 10],
        ]),
        student('user2', [
          ['D', 80],
          ['C', 20],
        ]),
      ])

      expect(await assign(1)).toEqual({
        user1: ['B'],
        user2: ['D', 'C'],
      })
    })
  })
})
