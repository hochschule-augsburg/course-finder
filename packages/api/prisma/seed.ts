/* cSpell:disable */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { readFileSync } from 'fs'

import dummyCourses from './dummyCourses.json'
import dummyOfferedCourses from './dummyOfferedCourses.json'

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
  const phase = await prisma.enrollphase.create({
    data: {
      description: {
        de: 'Beschreibung der Anmeldephase...',
        en: 'Description of enrollment phase...',
      },
      end: new Date('2024-05-15'),
      id: 1,
      start: new Date('2024-02-28'),
      title: {
        de: 'Anmeldung zum Sommersemester 2024',
        en: 'Spring Semester 2024 Enrollment',
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
                create: { creditsNeeded: 10, phaseId: phase.id },
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
    data: dummyCourses.map((e) => ({
      ...e,
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
    })),
  })
  await prisma.offeredCourse.createMany({
    data: dummyOfferedCourses.map((course) => ({
      ...course,
      appointments: {
        dates: course.appointments.dates,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
        type: course.appointments.type as any,
      },
    })),
  })
}

function hashPassword(password: string, salt: string) {
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex')
}
