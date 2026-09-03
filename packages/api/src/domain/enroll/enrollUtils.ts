import type { Student } from '../../generated/prisma/client.js'
import type {
  ClientUser,
  ClientUserExtended,
} from '../../prisma/PrismaTypes.ts'

import { prisma } from '../../prisma/prisma.ts'

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

export function mayEnroll(
  user: ClientUser & { Student: Student },
  allowedEmails: string[] = [],
) {
  if (!user.Student) {
    return false
  }
  if (
    allowedEmails.some(
      (email) => email.toLowerCase() === user.email.toLowerCase(),
    )
  ) {
    return true
  }
  if (
    user.Student.finalDegree === 'Master' ||
    user.Student.fieldOfStudy === 'Systems Engineering (Bachelor)'
  ) {
    return true
  }
  // allow enrollment for 2nd term bachelor students of Informatik and Wirtschaftsinformatik
  if (
    ['Informatik (Bachelor)', 'Wirtschaftsinformatik (Bachelor)'].includes(
      user.Student.fieldOfStudy,
    ) &&
    (user.Student.term ?? 0) >= 2
  ) {
    return true
  }
  return (user.Student.term ?? 0) > 2
}

export async function enrichUserWithMayEnroll(
  user: ClientUserExtended,
): Promise<ClientUserExtended> {
  if (!user.Student) {
    return user
  }
  const conf = await prisma.appConf.findFirst({
    select: { allowedEnrollmentEmails: true },
  })
  return {
    ...user,
    Student: {
      ...user.Student,
      mayEnroll: mayEnroll(
        user as ClientUser & { Student: Student },
        conf?.allowedEnrollmentEmails,
      ),
    },
  }
}
