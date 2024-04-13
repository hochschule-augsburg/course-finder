/* cSpell:disable */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

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
      Prof: {
        create: {
          office: 'abc',
          telephone: '0000/0000',
        },
      },
      auth: { method: 'ldap' },
      email: 'juergen.scholz@hs-augsburg.de',
      facultyName: 'Informatik',
      name: 'Jürgen Scholz',
      type: 'Professor',
      username: 'scholz',
    },
  })
  await prisma.user.create({
    data: {
      Prof: {
        create: {
          office: 'xyz',
          telephone: '1111/1111',
        },
      },
      auth: {
        method: 'local',
        password: hashPassword('prof1', 'salt'),
        salt: 'salt',
      },
      email: 'another.professor@example.com',
      facultyName: 'Informatik',
      name: 'Another Professor',
      type: 'Professor',
      username: 'prof1',
    },
  })

  // Create courses
  await prisma.course.create({
    data: {
      Lecturers: { connect: { username: 'scholz' } },
      creditPoints: 6,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { content: [], for: 'all' },
      examinationNumbers: ['CS101-001', 'CS101-002'],
      facultyName: 'Gestaltung',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      literature: ['Textbook 1', 'Textbook 2'],
      moduleCode: 'CS101',
      published: true,
      requirements: ['Basic understanding of programming'],
      semesterHours: 4,
      title: {
        de: 'Einführung in die Informatik',
        en: 'Introduction to Computer Science',
      },
    },
  })
  await prisma.course.create({
    data: {
      Lecturers: { connect: { username: 'scholz' } },
      creditPoints: 4,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { content: [], for: 'all' },
      examinationNumbers: ['PHIL101-001', 'PHIL101-002'],
      facultyName: 'Informatik',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      literature: ['Philosophy Book 1', 'Philosophy Book 2'],
      moduleCode: 'PHIL101',
      published: true,
      requirements: ['None'],
      semesterHours: 3,
      title: {
        de: 'Einführung in die Philosophie',
        en: 'Introduction to Philosophy',
      },
    },
  })
  await prisma.course.create({
    data: {
      Lecturers: { connect: { username: 'prof1' } },
      creditPoints: 6,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { content: [], for: 'all' },
      examinationNumbers: ['MATH101-001', 'MATH101-002'],
      facultyName: 'Informatik',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      literature: ['Calculus Book 1', 'Calculus Book 2'],
      moduleCode: 'MATH101',
      published: true,
      requirements: ['High school mathematics'],
      semesterHours: 4,
      title: { de: 'Analysis I', en: 'Calculus I' },
    },
  })
  await prisma.course.createMany({
    data: [
      {
        creditPoints: 5,
        description: {
          de: 'Beschreibung des Kurses...',
          en: 'Description of the course...',
        },
        examType: { content: [], for: 'all' },
        examinationNumbers: ['CHEM101-001', 'CHEM101-002'],
        facultyName: 'Informatik',
        language: 'English',
        learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
        lecturerNames: ['Professor 4'],
        literature: ['Chemistry Book 1', 'Chemistry Book 2'],
        moduleCode: 'CHEM101',
        published: true,
        requirements: ['Basic understanding of science'],
        semesterHours: 3,
        title: {
          de: 'Einführung in die Chemie',
          en: 'Introduction to Chemistry',
        },
      },
      {
        creditPoints: 4,
        description: {
          de: 'Beschreibung des Kurses...',
          en: 'Description of the course...',
        },
        examType: { content: [], for: 'all' },
        examinationNumbers: ['HIST101-001', 'HIST101-002'],
        facultyName: 'Informatik',
        language: 'English',
        learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
        lecturerNames: ['Professor 5'],
        literature: ['History Book 1', 'History Book 2'],
        moduleCode: 'HIST101',
        published: true,
        requirements: ['None'],
        semesterHours: 3,
        title: { de: 'Weltgeschichte', en: 'World History' },
      },
      {
        creditPoints: 6,
        description: {
          de: 'Beschreibung des Kurses...',
          en: 'Description of the course...',
        },
        examType: { content: [], for: 'all' },
        examinationNumbers: ['PHYS101-001', 'PHYS101-002'],
        facultyName: 'Informatik',
        language: 'English',
        learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
        lecturerNames: ['Professor 6'],
        literature: ['Physics Book 1', 'Physics Book 2'],
        moduleCode: 'PHYS101',
        published: true,
        requirements: ['High school physics'],
        semesterHours: 4,
        title: { de: 'Physik für Ingenieure', en: 'Physics for Engineers' },
      },
    ],
  })

  // Create enroll phases
  await prisma.enrollphase.createMany({
    data: [
      {
        description: {
          de: 'Beschreibung der Anmeldephase...',
          en: 'Description of enrollment phase...',
        },
        end: new Date('2024-03-15'),
        start: new Date('2024-02-28'),
        title: {
          de: 'Anmeldung zum Sommersemester 2024',
          en: 'Spring Semester 2024 Enrollment',
        },
      },
    ],
  })

  // Create offered courses
  await prisma.offeredCourse.createMany({
    data: [
      {
        appointments: {
          dates: [
            {
              endTime: new Date('02 October 2024 15:30').toISOString(),
              startTime: new Date('02 October 2024 14:00').toISOString(),
            },
            {
              endTime: new Date('03 October 2024 09:30').toISOString(),
              startTime: new Date('03 October 2024 08:00').toISOString(),
            },
          ],
          type: dateType.WEEKLY,
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
              endTime: new Date('02 October 2024 09:30').toISOString(),
              startTime: new Date('02 October 2024 08:00').toISOString(),
            },
            {
              endTime: new Date('03 October 2024 09:30').toISOString(),
              startTime: new Date('03 October 2024 08:00').toISOString(),
            },
            {
              endTime: new Date('04 October 2024 09:30').toISOString(),
              startTime: new Date('04 October 2024 08:00').toISOString(),
            },
            {
              endTime: new Date('05 October 2024 09:30').toISOString(),
              startTime: new Date('05 October 2024 08:00').toISOString(),
            },
          ],
          type: dateType.BLOCK,
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
              endTime: new Date('02 October 2024 09:30').toISOString(),
              startTime: new Date('02 October 2024 08:00').toISOString(),
            },
            {
              endTime: new Date('11 October 2024 11:20').toISOString(),
              startTime: new Date('11 October 2024 09:50').toISOString(),
            },
            {
              endTime: new Date('14 October 2024 09:30').toISOString(),
              startTime: new Date('14 October 2024 08:00').toISOString(),
            },
            {
              endTime: new Date('22 October 2024 15:30').toISOString(),
              startTime: new Date('22 October 2024 14:00').toISOString(),
            },
          ],
          type: dateType.IRREGULAR,
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
              endTime: new Date('02 October 2024 15:30').toISOString(),
              startTime: new Date('02 October 2024 14:00').toISOString(),
            },
            {
              endTime: new Date('03 October 2024 09:30').toISOString(),
              startTime: new Date('03 October 2024 08:00').toISOString(),
            },
          ],
          type: dateType.WEEKLY,
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
              endTime: new Date('02 October 2024 15:30').toISOString(),
              startTime: new Date('02 October 2024 14:00').toISOString(),
            },
            {
              endTime: new Date('03 October 2024 09:30').toISOString(),
              startTime: new Date('03 October 2024 08:00').toISOString(),
            },
          ],
          type: dateType.WEEKLY,
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
        facultyName: 'Informatik', // Replace with actual faculty name
        name: 'Singh Raj',
        type: 'student',
        username: 'singhraj',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('mitroska', 'salt'),
          salt: 'salt',
        },
        email: 'mitroska@example.com',
        facultyName: 'Informatik', // Replace with actual faculty name
        name: 'Mitroska',
        type: 'student',
        username: 'mitroska',
      },
      {
        auth: {
          method: 'local',
          password: hashPassword('seka', 'salt'),
          salt: 'salt',
        },
        email: 'seka@example.com',
        facultyName: 'Informatik', // Replace with actual faculty name
        name: 'Seka',
        type: 'student',
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
        facultyName: 'Informatik', // Replace with actual faculty name
        name: 'Stud1',
        type: 'student',
        username: 'stud1',
      },
    ],
  })

  await prisma.student.createMany({
    data: [
      { fieldOfStudy: 'Computer Science', username: 'singhraj' },
      { fieldOfStudy: 'Mathematics', username: 'mitroska' },
      { fieldOfStudy: 'Physics', username: 'seka' },
      { fieldOfStudy: 'Biology', username: 'stud1' },
    ],
  })
  await prisma.studentChoice.createMany({
    data: [
      // For singhraj
      {
        lastChange: new Date(),
        offeredCourseId: 1,
        points: 250,
        studentId: 'singhraj',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 2,
        points: 200,
        studentId: 'singhraj',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 3,
        points: 300,
        studentId: 'singhraj',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 4,
        points: 250,
        studentId: 'singhraj',
      },
      // For mitroska
      {
        lastChange: new Date(),
        offeredCourseId: 1,
        points: 180,
        studentId: 'mitroska',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 2,
        points: 220,
        studentId: 'mitroska',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 3,
        points: 250,
        studentId: 'mitroska',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 4,
        points: 350,
        studentId: 'mitroska',
      },
      // For seka
      {
        lastChange: new Date(),
        offeredCourseId: 1,
        points: 150,
        studentId: 'seka',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 2,
        points: 200,
        studentId: 'seka',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 3,
        points: 350,
        studentId: 'seka',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 4,
        points: 300,
        studentId: 'seka',
      },
      // For stud1
      {
        lastChange: new Date(),
        offeredCourseId: 1,
        points: 220,
        studentId: 'stud1',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 2,
        points: 180,
        studentId: 'stud1',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 3,
        points: 200,
        studentId: 'stud1',
      },
      {
        lastChange: new Date(),
        offeredCourseId: 4,
        points: 400,
        studentId: 'stud1',
      },
    ],
  })
}

function hashPassword(password: string, salt: string) {
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex')
}

/**
 * dateType refers to the recurrence of the dates.
 * Weekly: listed dates recur every week in the same times.
 * Block: listed dates are near each other.
 * Irregular: listed dates are irregular.
 */
const dateType = {
  BLOCK: 'block',
  IRREGULAR: 'irregular',
  WEEKLY: 'weekly',
}
