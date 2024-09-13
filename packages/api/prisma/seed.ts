/* cSpell:disable */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { random, sampleSize, sumBy, uniqBy } from 'lodash-es'

import { hashPassword } from '../src/domain/user/local/password-auth.ts'
import { data as coursesData } from './assets/courses.ts'
import { data as offeredCoursesSS24Data } from './assets/oldOfferedCoursesSS24.ts'
import { data as offeredCoursesWS2324Data } from './assets/oldOfferedCoursesWS23_24.ts'

const prisma = new PrismaClient()

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
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

  await prisma.user.create({
    data: {
      auth: {
        method: 'local',
        password: await hashPassword('user-2fa', 'salt'),
        salt: 'salt',
        twoFA: true,
      },
      email: 'test@test.com',
      name: 'Niklas',
      type: 'Professor',
      username: 'user-2fa',
    },
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
        password: await hashPassword('prof1', 'salt'),
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
          creditPoints: 6,
          editor: { connect: { username: 'scholz' } },
          Faculty: { connect: { name: 'Informatik' } },
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
        de: 'Anmeldung zu den Wahlpflichtfächern für das Wintersemester 2023/24',
        en: 'Registration for the elective courses for the winter semester 2023/24',
      },
      emailNotificationAt: getHalfTime(
        new Date('2023-09-29'),
        new Date('2023-10-06'),
      ),
      end: new Date('2023-10-06'),
      id: 1,
      start: new Date('2023-09-29'),
      state: 'FINISHED',
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
      emailNotificationAt: getHalfTime(
        new Date('2024-03-03'),
        new Date('2024-03-18'),
      ),
      end: new Date('2024-03-18'),
      id: 2,
      publishedTry: 1,
      start: new Date('2024-03-03'),
      state: 'FINISHED',
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
      state: 'OPEN',
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
          password: await hashPassword('admin', 'salt'),
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
          password: await hashPassword('prof', 'salt'),
          salt: 'salt',
        },
        email: 'admin@example.com',
        name: 'Prof',
        type: 'Professor',
        username: 'prof',
      },
    ],
  })

  await Promise.all(
    [
      ['Informatik (Bachelor)', '1'],
      ['Informatik (Bachelor)', 'in'],
      ['Wirtschaftsinformatik (Bachelor)', 'win'],
      ['Technische Informatik (Bachelor)', 'ti'],
      ['International Information Systems (Bachelor)', 'iis'],
      ['Interaktive Medien (Bachelor)', 'ia'],
      ['Applied Research (Master)', 'mapr'],
      ['Informatik (Master)', 'min'],
      ['Business Information Systems (Master)', 'bis'],
      ['Interaktive Mediensysteme (Master)', 'ims'],
      ['Industrielle Sicherheit', 'ins'],
    ].map(async ([study, abbr]) => {
      await prisma.user.create({
        data: {
          auth: {
            method: 'local' as const,
            password: await hashPassword(`stud-${abbr}`, 'salt'),
            salt: 'salt',
          },
          email: `stud${abbr}@example.com`,
          name: `student ${abbr}`,
          Student: {
            create: {
              facultyName: 'Informatik',
              fieldOfStudy: study,
              StudentPhase: {
                create: { creditsNeeded: random(1, 10), phaseId: 3 },
              },
              term: 4,
            },
          },
          type: 'Student',
          username: `stud-${abbr}`,
        },
      })
    }),
  )

  // Not in Modulhandbuch
  await prisma.course.create({
    data: {
      creditPoints: 5,
      Faculty: { connect: { name: 'Informatik' } },
      lecturers: ['Prof. Dr. Christoph Buck'],
      moduleCode: '__SES4.WP',
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      semesterHours: 4,
      title: { de: 'Social Entrepreneurship', en: 'Social Entrepreneurship' },
    },
  })
  await prisma.course.create({
    data: {
      creditPoints: 2,
      Faculty: { connect: { name: 'Informatik' } },
      lecturers: ['Helia Hollmann', 'Philipp Schurk'],
      moduleCode: '__ISB.WP',
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      semesterHours: 2,
      title: {
        de: 'Industrial Security Basics',
        en: 'Industrial Security Basics',
      },
    },
  })
  await prisma.course.create({
    data: {
      creditPoints: 5,
      Faculty: { connect: { name: 'Informatik' } },
      lecturers: ['Helia Hollmann'],
      moduleCode: '__CAS.WP',
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      semesterHours: 4,
      title: {
        de: 'Cryptography and Security',
        en: 'Cryptography and Security',
      },
    },
  })
  await prisma.course.create({
    data: {
      creditPoints: 5,
      Faculty: { connect: { name: 'Informatik' } },
      lecturers: ['Prof. Dr. Wolfgang Kowarschick'],
      moduleCode: '__PRT.WP',
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      semesterHours: 4,
      title: {
        de: 'Projekttechniken',
        en: 'Project Techniques',
      },
    },
  })

  await prisma.course.createMany({
    data: coursesData.map((e) => ({
      ...e,
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      title: { de: e.title.de ?? e.title.en, en: e.title.en ?? e.title.de },
    })),
  })
  await prisma.offeredCourse.createMany({
    data: offeredCoursesSS24Data,
  })
  await prisma.offeredCourse.createMany({
    data: offeredCoursesWS2324Data,
  })

  const testPhaseCourses = uniqBy(
    [...offeredCoursesSS24Data, ...offeredCoursesWS2324Data],
    (e) => e.moduleCode,
  )
  await prisma.offeredCourse.createMany({
    data: testPhaseCourses.map((e) => ({ ...e, phaseId: 3 })),
  })

  const students = await prisma.student.findMany()
  const choices = students.flatMap((student) => {
    const choices = sampleSize(testPhaseCourses, random(0, 6)).map(
      (course) => ({
        moduleCode: course.moduleCode,
        points: Math.random(),
      }),
    )
    const scale = 100 / sumBy(choices, 'points')
    return choices.map((choice) => ({
      moduleCode: choice.moduleCode,
      points: Math.round(choice.points * scale),
      username: student.username,
    }))
  })

  await prisma.studentChoice.createMany({
    data: choices.map((choice) => ({
      moduleCode: choice.moduleCode,
      phaseId: 3,
      points: choice.points,
      username: choice.username,
    })),
  })

  const choicesAssign = students.flatMap((student) => {
    const choices = sampleSize(offeredCoursesSS24Data, random(0, 6)).map(
      (course) => ({
        moduleCode: course.moduleCode,
        points: Math.random(),
      }),
    )
    const scale = 100 / sumBy(choices, 'points')
    return choices.map((choice) => ({
      moduleCode: choice.moduleCode,
      points: Math.round(choice.points * scale),
      username: student.username,
    }))
  })
  await prisma.studentPhase.createMany({
    data: students.map((student) => ({
      creditsNeeded: random(1, 10),
      phaseId: 2,
      username: student.username,
    })),
  })
  await prisma.studentChoice.createMany({
    data: choicesAssign.map((choice) => ({
      moduleCode: choice.moduleCode,
      phaseId: 2,
      points: choice.points,
      username: choice.username,
    })),
  })
  await prisma.phaseAssignment.createMany({
    data: sampleSize(choicesAssign, random(0, choicesAssign.length)).map(
      (e) => ({
        moduleCode: e.moduleCode,
        phaseId: 2,
        tryNo: 1,
        username: e.username,
      }),
    ),
  })
}

function getHalfTime(date1: Date, date2: Date) {
  return new Date((date1.getTime() + date2.getTime()) / 2)
}
