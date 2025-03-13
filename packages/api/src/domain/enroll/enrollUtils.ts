import type { Student } from '@prisma/client'

import type { ClientUser } from '../../prisma/PrismaTypes.ts'

/* eslint-disable perfectionist/sort-objects */

// keep in sync with packages/ui/src/helper/enums/fieldsOfStudy.ts
export const fieldsOfStudy: Record<
  string,
  { abbr: string; degree: 'Bachelor' | 'Master' }
> = {
  'Informatik (Bachelor)': { abbr: 'IN', degree: 'Bachelor' },
  'Wirtschaftsinformatik (Bachelor)': { abbr: 'WI', degree: 'Bachelor' },
  'Technische Informatik (Bachelor)': { abbr: 'TI', degree: 'Bachelor' },
  'International Information Systems (Bachelor)': {
    abbr: 'IIS',
    degree: 'Bachelor',
  },
  'Systems Engineering (Bachelor)': { abbr: 'SE', degree: 'Bachelor' },
  // 'Interaktive Medien (Bachelor)': { abbr: 'IA', academicRank: 'Bachelor' },
  'Applied Research (Master)': { abbr: 'MAPR', degree: 'Master' },
  'Informatik (Master)': { abbr: 'MIN', degree: 'Master' },
  'Business Information Systems (Master)': {
    abbr: 'BIS',
    degree: 'Master',
  },
  'Interaktive Mediensysteme (Master)': { abbr: 'IMS', degree: 'Master' },
  'Industrielle Sicherheit': { abbr: 'INS', degree: 'Master' },
}

export function mayEnroll(user: { Student: Student } & ClientUser) {
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
