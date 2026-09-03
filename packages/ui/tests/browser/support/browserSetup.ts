import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { trpc as trpcType } from '@/trpc'

export const defaultMockSubjects = [
  {
    moduleCode: 'CS101',
    title: { de: 'Machine Learning', en: 'Machine Learning' },
    shortDescription: { de: 'ML', en: 'ML' },
    sws: 4,
    credits: 5,
    facultyId: 'fi',
  },
  {
    moduleCode: 'CS102',
    title: { de: 'Web Security', en: 'Web Security' },
    shortDescription: { de: 'WS', en: 'WS' },
    sws: 4,
    credits: 5,
    facultyId: 'fi',
  },
]

export const defaultMockUser = {
  id: 'student-1',
  type: 'Student' as const,
  Student: {
    id: 's-1',
    userId: 'student-1',
    fieldOfStudy: 'IN',
    semester: 4,
    mayEnroll: true,
  },
}

export const trpcMock = mockDeep<typeof trpcType>()

vi.mock('@/trpc', () => ({
  trpc: trpcMock,
}))

beforeEach(() => {
  mockReset(trpcMock)
  trpcMock.auth.getUser.query.mockResolvedValue(defaultMockUser as any)
  trpcMock.course.getCurrentPhase.query.mockResolvedValue(null)
  trpcMock.course.getCourses.query.mockResolvedValue(defaultMockSubjects as any)
  trpcMock.course.getPhaseCourses.query.mockResolvedValue(defaultMockSubjects as any)
  trpcMock.enroll.list.query.mockResolvedValue({ choices: [], creditsNeeded: 0 })
  trpcMock.enroll.upsert.mutate.mockResolvedValue({} as any)
  trpcMock.enroll.delete.mutate.mockResolvedValue({} as any)
  trpcMock.enroll.bulk.mutate.mockResolvedValue({ choices: [], creditsNeeded: 0 })
  trpcMock.appConf.read.query.mockResolvedValue({ maxCredits: 30 } as any)
})
