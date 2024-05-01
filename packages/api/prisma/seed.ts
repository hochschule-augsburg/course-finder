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
      {
        name: 'Gestaltung',
        translatedName: { de: 'Gestaltung', en: 'Arts' },
      },
      {
        name: 'Naturwissenschaften',
        translatedName: { de: 'Naturwissenschaften', en: 'Science' },
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

  // Create courses
  await prisma.course.create({
    data: {
      creditPoints: 6,
      facultyName: 'Gestaltung',
      lecturers: ['scholz'],
      moduleCode: 'CS101',
      published: true,
      semesterHours: 4,
      title: {
        de: 'Einführung in die Informatik',
        en: 'Introduction to Computer Science',
      },
    },
  })
  await prisma.course.create({
    data: {
      creditPoints: 4,
      facultyName: 'Informatik',
      infoUrl: 'https://example.com',
      lecturers: ['scholz'],
      moduleCode: 'PHIL101',
      published: true,
      semesterHours: 3,
      title: {
        de: 'Einführung in die Philosophie',
        en: 'Introduction to Philosophy',
      },
    },
  })
  await prisma.course.create({
    data: {
      creditPoints: 6,
      facultyName: 'Informatik',
      lecturers: ['prof1'],
      moduleCode: 'MATH101',
      pdf: Buffer.alloc(stubPdf.length, stubPdf),
      published: true,
      semesterHours: 4,
      title: { de: 'Analysis I', en: 'Calculus I' },
    },
  })
  await prisma.course.createMany({
    data: [
      {
        creditPoints: 5,
        facultyName: 'Informatik',
        moduleCode: 'CHEM101',
        published: true,
        semesterHours: 3,
        title: {
          de: 'Einführung in die Chemie',
          en: 'Introduction to Chemistry',
        },
      },
      {
        creditPoints: 4,
        facultyName: 'Informatik',
        lecturers: ['Professor 5'],
        moduleCode: 'HIST101',
        published: true,
        semesterHours: 3,
        title: { de: 'Weltgeschichte', en: 'World History' },
      },
      {
        creditPoints: 6,
        facultyName: 'Informatik',
        lecturers: ['Professor 6'],
        moduleCode: 'PHYS101',
        published: true,
        semesterHours: 4,
        title: { de: 'Physik für Ingenieure', en: 'Physics for Engineers' },
      },
    ],
  })

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

  // Create offered courses
  await prisma.offeredCourse.createMany({
    data: [
      {
        appointments: {
          dates: [
            {
              from: new Date('02 October 2024 14:00').toISOString(),
              to: new Date('02 October 2024 15:30').toISOString(),
            },
            {
              from: new Date('03 October 2024 08:00').toISOString(),
              to: new Date('03 October 2024 09:30').toISOString(),
            },
          ],
          type: 'irregular',
        },
        extraInfo: 'Room A, Building 1',
        maxParticipants: 40,
        minParticipants: 10,
        moduleCode: 'PHIL101',
        phaseId: 1,
      },
      {
        appointments: {
          dates: [
            {
              from: new Date('02 October 2024 08:00').toISOString(),
              to: new Date('02 October 2024 09:30').toISOString(),
            },
            {
              from: new Date('03 October 2024 08:00').toISOString(),
              to: new Date('03 October 2024 09:30').toISOString(),
            },
            {
              from: new Date('04 October 2024 08:00').toISOString(),
              to: new Date('04 October 2024 09:30').toISOString(),
            },
            {
              from: new Date('05 October 2024 08:00').toISOString(),
              to: new Date('05 October 2024 09:30').toISOString(),
            },
          ],
          type: 'block',
        },
        extraInfo: 'Room B, Building 2',
        maxParticipants: 35,
        minParticipants: 5,
        moduleCode: 'MATH101',
        phaseId: 1,
      },
      {
        appointments: {
          dates: [
            {
              from: new Date('02 October 2024 08:00').toISOString(),
              to: new Date('02 October 2024 09:30').toISOString(),
            },
            {
              from: new Date('11 October 2024 09:50').toISOString(),
              to: new Date('11 October 2024 11:20').toISOString(),
            },
            {
              from: new Date('14 October 2024 08:00').toISOString(),
              to: new Date('14 October 2024 09:30').toISOString(),
            },
            {
              from: new Date('22 October 2024 14:00').toISOString(),
              to: new Date('22 October 2024 15:30').toISOString(),
            },
          ],
          type: 'irregular',
        },
        extraInfo: 'Room C, Building 3',
        maxParticipants: 5,
        minParticipants: 2,
        moduleCode: 'CHEM101',
        phaseId: 1,
      },
      {
        appointments: {
          dates: [
            {
              from: new Date('02 October 2024 14:00').toISOString(),
              to: new Date('02 October 2024 15:30').toISOString(),
            },
            {
              from: new Date('03 October 2024 08:00').toISOString(),
              to: new Date('03 October 2024 09:30').toISOString(),
            },
          ],
          type: 'weekly',
        },
        extraInfo: 'Room D, Building 4',
        maxParticipants: 50,
        minParticipants: 5,
        moduleCode: 'HIST101',
        phaseId: 1,
      },
      {
        appointments: {
          dates: [
            {
              from: new Date('02 October 2024 14:00').toISOString(),
              to: new Date('02 October 2024 15:30').toISOString(),
            },
            {
              from: new Date('03 October 2024 08:00').toISOString(),
              to: new Date('03 October 2024 09:30').toISOString(),
            },
          ],
          type: 'weekly',
        },
        extraInfo: 'Room E, Building 5',
        maxParticipants: 40,
        minParticipants: 10,
        moduleCode: 'PHYS101',
        phaseId: 1,
      },
    ],
  })
  await prisma.user.createMany({
    data: [
      {
        auth: {
          method: 'local',
          password: hashPassword('singhraj', 'salt'),
          salt: 'salt',
        },
        email: 'singhraj@example.com',
        name: 'Singh Raj',
        type: 'Student',
        username: 'singhraj',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('mitroska', 'salt'),
          salt: 'salt',
        },
        email: 'mitroska@example.com',
        name: 'Mitroska',
        type: 'Student',
        username: 'mitroska',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('seka', 'salt'),
          salt: 'salt',
        },
        email: 'seka@example.com',
        name: 'Seka',
        type: 'Student',
        username: 'seka',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('stud1', 'salt'),
          salt: 'salt',
          twoFA: true,
        },
        email: 'stud1@example.com',
        name: 'Stud1',
        type: 'Student',
        username: 'stud1',
      },
    ],
  })

  await prisma.student.createMany({
    data: [
      {
        facultyName: 'Informatik',
        fieldOfStudy: 'Computer Science',
        username: 'singhraj',
      },
      {
        facultyName: 'Informatik',
        fieldOfStudy: 'Mathematics',
        username: 'mitroska',
      },
      { facultyName: 'Informatik', fieldOfStudy: 'Physics', username: 'seka' },
      { facultyName: 'Informatik', fieldOfStudy: 'Biology', username: 'stud1' },
    ],
  })

  await prisma.studentPhase.createMany({
    data: [
      { phaseId: phase.id, username: 'singhraj' },
      { phaseId: phase.id, username: 'mitroska' },
      { phaseId: phase.id, username: 'seka' },
      { phaseId: phase.id, username: 'stud1' },
    ],
  })

  await prisma.studentChoice.createMany({
    data: [
      // For singhraj
      {
        lastChange: new Date(),
        moduleCode: 'PHIL101',
        phaseId: phase.id,
        points: 250,
        username: 'singhraj',
      },
      {
        lastChange: new Date(),
        moduleCode: 'MATH101',
        phaseId: phase.id,
        points: 200,
        username: 'singhraj',
      },
      {
        lastChange: new Date(),
        moduleCode: 'CHEM101',
        phaseId: phase.id,
        points: 300,
        username: 'singhraj',
      },
      {
        lastChange: new Date(),
        moduleCode: 'HIST101',
        phaseId: phase.id,
        points: 250,
        username: 'singhraj',
      },
      // For mitroska
      {
        lastChange: new Date(),
        moduleCode: 'PHIL101',
        phaseId: phase.id,
        points: 180,
        username: 'mitroska',
      },
      {
        lastChange: new Date(),
        moduleCode: 'MATH101',
        phaseId: phase.id,
        points: 220,
        username: 'mitroska',
      },
      {
        lastChange: new Date(),
        moduleCode: 'CHEM101',
        phaseId: phase.id,
        points: 250,
        username: 'mitroska',
      },
      {
        lastChange: new Date(),
        moduleCode: 'HIST101',
        phaseId: phase.id,
        points: 350,
        username: 'mitroska',
      },
      // For seka
      {
        lastChange: new Date(),
        moduleCode: 'PHIL101',
        phaseId: phase.id,
        points: 150,
        username: 'seka',
      },
      {
        lastChange: new Date(),
        moduleCode: 'MATH101',
        phaseId: phase.id,
        points: 200,
        username: 'seka',
      },
      {
        lastChange: new Date(),
        moduleCode: 'CHEM101',
        phaseId: phase.id,
        points: 350,
        username: 'seka',
      },
      {
        lastChange: new Date(),
        moduleCode: 'HIST101',
        phaseId: phase.id,
        points: 300,
        username: 'seka',
      },
      // For stud1
      {
        lastChange: new Date(),
        moduleCode: 'PHIL101',
        phaseId: phase.id,
        points: 220,
        username: 'stud1',
      },
      {
        lastChange: new Date(),
        moduleCode: 'MATH101',
        phaseId: phase.id,
        points: 180,
        username: 'stud1',
      },
      {
        lastChange: new Date(),
        moduleCode: 'CHEM101',
        phaseId: phase.id,
        points: 200,
        username: 'stud1',
      },
      {
        lastChange: new Date(),
        moduleCode: 'HIST101',
        phaseId: phase.id,
        points: 400,
        username: 'stud1',
      },
    ],
  })

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
