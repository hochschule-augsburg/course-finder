/* cSpell:disable */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { readFileSync } from 'fs'

import { data as coursesData } from './assets/courses'
import { data as offeredCoursesSS24Data } from './assets/oldOfferedCoursesSS24'
import { data as offeredCoursesWS2324Data } from './assets/oldOfferedCoursesWS23_24'

const prisma = new PrismaClient()

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function main() {
  const stubPdf = readFileSync('./prisma/assets/compiler.pdf')
  // Create faculties
  await prisma.faculty.createMany({
    data: [
      {
        name: 'Informatik',
        translatedName: { de: 'Informatik', en: 'ComputerScience' },
      },
    ],
  })

  // Create professors
  await prisma.user.create({
    data: {
      auth: { method: 'ldap' },
      email: 'juergen.scholz@hs-augsburg.de',
      name: 'Jürgen Scholz',
      type: 'Professor',
      username: 'scholz',
    },
  })
  await prisma.user.create({
    data: {
      auth: {
        method: 'local',
        password: hashPassword('prof1', 'salt'),
        salt: 'salt',
      },
      email: 'another.professor@example.com',
      name: 'Another Professor',
      type: 'Professor',
      username: 'prof1',
    },
  })

  await Promise.all(
    [
      {
        pdf: Buffer.alloc(stubPdf.length, stubPdf),
      },
      {
        infoUrl: 'http://example.com',
      },
      {
        extraInfo: 'course extra',
      },
    ].map((course, i) => {
      return prisma.course.create({
        data: {
          ...course,
          Faculty: { connect: { name: 'Informatik' } },
          creditPoints: 6,
          editor: { connect: { username: 'scholz' } },
          lecturers: ['Scholz'],
          moduleCode: `test${i}`,
          published: true,
          semesterHours: 4,
          title: {
            de: `Test Kurs ${i}`,
            en: `Test Course ${i}`,
          },
        },
      })
    }),
  )

  // Create enroll phases
  await prisma.enrollphase.create({
    data: {
      description: {
        de: 'Anmeldung zu den Wahlpflichtfächern für das Sommersemester 2023',
        en: 'Registration for the elective courses for the summer semester 2023',
      },
      end: new Date('2023-10-06'),
      id: 1,
      start: new Date('2024-09-29'),
      title: {
        de: 'FWP Anmeldung Wintersemester 2023/24',
        en: 'FWP Registration Winter Semester 2023/24',
      },
    },
  })

  await prisma.enrollphase.create({
    data: {
      description: {
        de: 'Anmeldung zu den Wahlpflichtfächern für das Sommersemester 2023',
        en: 'Registration for the elective courses for the summer semester 2023',
      },
      end: new Date('2024-03-18'),
      id: 2,
      start: new Date('2024-03-03'),
      title: {
        de: 'FWP Anmeldung Sommersemester 2024',
        en: 'FWP Registration Summer Semester 2024',
      },
    },
  })
  await prisma.enrollphase.create({
    data: {
      description: {
        de: 'Beschreibung der Anmeldephase...',
        en: 'Description of enrollment phase...',
      },
      end: new Date('2024-07-15'),
      id: 3,
      start: new Date('2024-03-30'),
      title: {
        de: 'Testanmeldungsphase 2024',
        en: 'Test Registration Phase 2024',
      },
    },
  })

  await prisma.user.createMany({
    data: [
      {
        auth: {
          method: 'local',
          password: hashPassword('admin', 'salt'),
          salt: 'salt',
        },
        email: 'admin@example.com',
        name: 'Admin',
        type: 'Admin',
        username: 'admin',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('prof', 'salt'),
          salt: 'salt',
        },
        email: 'admin@example.com',
        name: 'Prof',
        type: 'Professor',
        username: 'prof',
      },
    ],
  })

  Promise.all(
    [
      ['Informatik (Bachelor)', '1'],
      ['Informatik (Bachelor)', 'infba'],
      ['Wirtschaftsinformatik (Bachelor)', 'winba'],
      ['Technische Informatik (Bachelor)', 'tiba'],
      ['Informatik (Master)', 'infma'],
    ].map(async ([study, abbr]) => {
      await prisma.user.create({
        data: {
          Student: {
            create: {
              StudentPhase: {
                create: { creditsNeeded: 10, phaseId: 3 },
              },
              facultyName: 'Informatik',
              fieldOfStudy: study,
              term: 4,
            },
          },
          auth: {
            method: 'local' as const,
            password: hashPassword(`stud-${abbr}`, 'salt'),
            salt: 'salt',
          },
          email: `stud${abbr}@example.com`,
          name: `student ${abbr}`,
          type: 'Student',
          username: `stud-${abbr}`,
        },
      })
    }),
  )

  await prisma.course.createMany({
    data: coursesData.map((e) => ({
      ...e,
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
    })),
  })
  await prisma.offeredCourse.createMany({
    data: offeredCoursesSS24Data,
  })
  await prisma.offeredCourse.createMany({
    data: offeredCoursesWS2324Data,
  })
}

function hashPassword(password: string, salt: string) {
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex')
}
