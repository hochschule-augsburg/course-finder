import type { EnrollPhase } from '@workspace/api/src/prisma/PrismaTypes'
import type { Subject } from '@/stores/CoursesStore'
import type { EnrolledCourse } from '@/stores/EnrollmentStore'

export function createMockPhase(overrides: Partial<EnrollPhase> = {}): EnrollPhase {
  return {
    id: 'test-phase-1',
    title: { de: 'WPF Anmeldung SS25', en: 'Elective Registration SS25' },
    description: { de: 'Wichtige Infos zur Anmeldung', en: 'Important registration info' },
    state: 'OPEN',
    start: new Date('2025-04-01T08:00:00Z'),
    end: new Date('2025-04-15T18:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    facultyId: 'fi',
    ...overrides,
  } as EnrollPhase
}

export function createMockSubject(moduleCode: string, titleDe: string, titleEn: string, overrides: Partial<Subject> = {}): Subject {
  return {
    moduleCode,
    title: { de: titleDe, en: titleEn },
    shortDescription: { de: 'Beschreibung', en: 'Description' },
    sws: 4,
    credits: 5,
    facultyId: 'fi',
    ...overrides,
  } as Subject
}

export function createMockEnrolledCourse(
  moduleCode: string,
  points: number,
  autoFillOption: 'prio' | 'fallback' = 'prio',
  titleDe = `Fach ${moduleCode}`,
): EnrolledCourse {
  return {
    moduleCode,
    points,
    autoFillOption,
    title: { de: titleDe, en: `Course ${moduleCode}` },
  }
}
