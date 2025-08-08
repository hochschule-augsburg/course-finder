import type { Student } from '@prisma/client'

import type { ClientUser } from '../../prisma/PrismaTypes.ts'

// keep in sync with packages/ui/src/helper/enums/fieldsOfStudy.ts
export const fieldsOfStudy: Record<
  string,
  { abbr: string; degree: 'Bachelor' | 'Master' }
> = {
  // 'Interaktive Medien (Bachelor)': { abbr: 'IA', academicRank: 'Bachelor' },
  'Applied Research (Master)': { abbr: 'MAPR', degree: 'Master' },
  'Business Information Systems (Master)': {
    abbr: 'BIS',
    degree: 'Master',
  },
  'Industrielle Sicherheit': { abbr: 'INS', degree: 'Master' },
  'Informatik (Bachelor)': { abbr: 'IN', degree: 'Bachelor' },
  'Informatik (Master)': { abbr: 'MIN', degree: 'Master' },
  'Interaktive Mediensysteme (Master)': { abbr: 'IMS', degree: 'Master' },
  'International Information Systems (Bachelor)': {
    abbr: 'IIS',
    degree: 'Bachelor',
  },
  'Systems Engineering (Bachelor)': { abbr: 'SE', degree: 'Bachelor' },
  'Technische Informatik (Bachelor)': { abbr: 'TI', degree: 'Bachelor' },
  'Wirtschaftsinformatik (Bachelor)': { abbr: 'WI', degree: 'Bachelor' },
}

export function mayEnroll(user: ClientUser & { Student: Student }) {
  if (!user.Student) {
    return false
  }
  if (
    user.Student.finalDegree === 'Master' ||
    user.Student.fieldOfStudy === 'Systems Engineering (Bachelor)'
  ) {
    return true
  }
  return (user.Student.term ?? 0) > 2
}
