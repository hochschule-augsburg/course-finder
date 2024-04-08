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
      username: 'scholz',
      name: 'Jürgen Scholz',
      auth: { method: 'ldap' },
      email: 'juergen.scholz@hs-augsburg.de',
      facultyName: 'Informatik',
      type: 'Professor',
      Prof: {
        create: {
          office: 'abc',
          telephone: '0000/0000',
        },
      },
    },
  })
  await prisma.user.create({
    data: {
      username: 'prof1',
      name: 'Another Professor',
      auth: { method: 'local', password: hashPassword('prof1') },
      email: 'another.professor@example.com',
      facultyName: 'Informatik',
      type: 'Professor',
      Prof: {
        create: {
          office: 'xyz',
          telephone: '1111/1111',
        },
      },
    },
  })

  // Create courses
  await prisma.course.create({
    data: {
      creditPoints: 6,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { de: 'Schriftlich', en: 'Written' },
      examinationNumbers: ['CS101-001', 'CS101-002'],
      facultyName: 'Gestaltung',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      Lecturers: { connect: { username: 'scholz' } },
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
      creditPoints: 4,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { de: 'Schriftlich', en: 'Written' },
      examinationNumbers: ['PHIL101-001', 'PHIL101-002'],
      facultyName: 'Informatik',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      Lecturers: { connect: { username: 'scholz' } },
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
      creditPoints: 6,
      description: {
        de: 'Beschreibung des Kurses...',
        en: 'Description of the course...',
      },
      examType: { de: 'Schriftlich', en: 'Written' },
      examinationNumbers: ['MATH101-001', 'MATH101-002'],
      facultyName: 'Informatik',
      language: 'English',
      learningGoals: { de: 'Lernziele...', en: 'Learning goals...' },
      Lecturers: { connect: { username: 'prof1' } },
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
        examType: { de: 'Schriftlich', en: 'Written' },
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
        examType: { de: 'Schriftlich', en: 'Written' },
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
        examType: { de: 'Schriftlich', en: 'Written' },
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
  await prisma.offeredCourses.createMany({
    data: [
      {
        extraInfo: 'Room A, Building 1',
        moduleCode: 'PHIL101',
        phaseId: 1,
        times: { endTime: '11:00 AM', startTime: '9:00 AM' },
      },
      {
        extraInfo: 'Room B, Building 2',
        moduleCode: 'MATH101',
        phaseId: 1,
        times: { endTime: '12:00 PM', startTime: '10:00 AM' },
      },
      {
        extraInfo: 'Room C, Building 3',
        moduleCode: 'CHEM101',
        phaseId: 1,
        times: { endTime: '1:00 PM', startTime: '11:00 AM' },
      },
      {
        extraInfo: 'Room D, Building 4',
        moduleCode: 'HIST101',
        phaseId: 1,
        times: { endTime: '3:00 PM', startTime: '1:00 PM' },
      },
      {
        extraInfo: 'Room E, Building 5',
        moduleCode: 'PHYS101',
        phaseId: 1,
        times: { endTime: '4:00 PM', startTime: '2:00 PM' },
      },
    ],
  })
  await prisma.user.createMany({
    data: [
      {
        username: 'singhraj',
        email: 'singhraj@example.com',
        name: 'Singh Raj',
        auth: { method: 'local', password: hashPassword('singhraj') },
        type: 'student',
        facultyName: 'Informatik', // Replace with actual faculty name
      },
      {
        username: 'mitroska',
        email: 'mitroska@example.com',
        name: 'Mitroska',
        auth: { method: 'local', password: hashPassword('mitroska') },
        type: 'student',
        facultyName: 'Informatik', // Replace with actual faculty name
      },
      {
        username: 'seka',
        email: 'seka@example.com',
        name: 'Seka',
        auth: { method: 'local', password: hashPassword('seka') },
        type: 'student',
        facultyName: 'Informatik', // Replace with actual faculty name
      },
      {
        username: 'stud1',
        email: 'stud1@example.com',
        name: 'Stud1',
        auth: { method: 'local', password: hashPassword('stud1'), twoFA: true },
        type: 'student',
        facultyName: 'Informatik', // Replace with actual faculty name
      },
    ],
  })

  await prisma.student.createMany({
    data: [
      { username: 'singhraj', fieldOfStudy: 'Computer Science' },
      { username: 'mitroska', fieldOfStudy: 'Mathematics' },
      { username: 'seka', fieldOfStudy: 'Physics' },
      { username: 'stud1', fieldOfStudy: 'Biology' },
    ],
  })
  await prisma.studentChoice.createMany({
    data: [
      // For singhraj
      {
        studentId: 'singhraj',
        offeredCourseId: 1,
        points: 250,
        lastChange: new Date(),
      },
      {
        studentId: 'singhraj',
        offeredCourseId: 2,
        points: 200,
        lastChange: new Date(),
      },
      {
        studentId: 'singhraj',
        offeredCourseId: 3,
        points: 300,
        lastChange: new Date(),
      },
      {
        studentId: 'singhraj',
        offeredCourseId: 4,
        points: 250,
        lastChange: new Date(),
      },
      // For mitroska
      {
        studentId: 'mitroska',
        offeredCourseId: 1,
        points: 180,
        lastChange: new Date(),
      },
      {
        studentId: 'mitroska',
        offeredCourseId: 2,
        points: 220,
        lastChange: new Date(),
      },
      {
        studentId: 'mitroska',
        offeredCourseId: 3,
        points: 250,
        lastChange: new Date(),
      },
      {
        studentId: 'mitroska',
        offeredCourseId: 4,
        points: 350,
        lastChange: new Date(),
      },
      // For seka
      {
        studentId: 'seka',
        offeredCourseId: 1,
        points: 150,
        lastChange: new Date(),
      },
      {
        studentId: 'seka',
        offeredCourseId: 2,
        points: 200,
        lastChange: new Date(),
      },
      {
        studentId: 'seka',
        offeredCourseId: 3,
        points: 350,
        lastChange: new Date(),
      },
      {
        studentId: 'seka',
        offeredCourseId: 4,
        points: 300,
        lastChange: new Date(),
      },
      // For stud1
      {
        studentId: 'stud1',
        offeredCourseId: 1,
        points: 220,
        lastChange: new Date(),
      },
      {
        studentId: 'stud1',
        offeredCourseId: 2,
        points: 180,
        lastChange: new Date(),
      },
      {
        studentId: 'stud1',
        offeredCourseId: 3,
        points: 200,
        lastChange: new Date(),
      },
      {
        studentId: 'stud1',
        offeredCourseId: 4,
        points: 400,
        lastChange: new Date(),
      },
    ],
  })
}

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}
