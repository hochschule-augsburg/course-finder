import type { Student } from '@prisma/client'

import type { ClientUser } from '../../prisma/PrismaTypes'

const fieldsOfStudy: Record<
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
  'Technische Informatik (Bachelor)': { abbr: 'TI', degree: 'Bachelor' },
  'Wirtschaftsinformatik (Bachelor)': { abbr: 'WI', degree: 'Bachelor' },
}

export function mayEnroll(user: { Student: Student } & ClientUser) {
  if (!user.Student) {
    return false
  }
  const fieldOfStudy = fieldsOfStudy[user.Student.fieldOfStudy]
  if (fieldOfStudy.degree === 'Master') {
    return true
  }
  return (user.Student.term ?? 0) > 2
}
