import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
  await prisma.prof.createMany({
    data: [
      {
        email: 'prof1@example.com',
        facultyName: 'Informatik',
        name: 'Professor 1',
        office: 'Office A',
        telephone: '1234567890',
        username: 'prof1',
      },
      {
        email: 'prof2@example.com',
        facultyName: 'Informatik',
        name: 'Professor 2',
        username: 'prof2',
      },
      // Add more professors as needed
    ],
  })

  // Create courses
  await prisma.course.createMany({
    data: [
      {
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
        lecturerNames: ['Professor 1'],
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
      {
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
        lecturerNames: ['Professor 2'],
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
      {
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
        lecturerNames: ['Professor 3'],
        literature: ['Calculus Book 1', 'Calculus Book 2'],
        moduleCode: 'MATH101',
        published: true,
        requirements: ['High school mathematics'],
        semesterHours: 4,
        title: { de: 'Analysis I', en: 'Calculus I' },
      },
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

  // Student 2
  await prisma.student.create({
    data: {
      email: 'student2@example.com',
      facultyName: 'Informatik',
      fieldOfStudy: 'Computer Science',
      name: 'Student 2',
      username: 'student2',
    },
  })

  // Student 3
  await prisma.student.create({
    data: {
      StudentChoice: {
        create: [
          { lastChange: new Date(), offeredCourseId: 1, points: 100 },
          { lastChange: new Date(), offeredCourseId: 2, points: 200 },
          { lastChange: new Date(), offeredCourseId: 3, points: 300 },
          { lastChange: new Date(), offeredCourseId: 4, points: 150 },
          { lastChange: new Date(), offeredCourseId: 5, points: 250 },
        ],
      },
      birthDate: new Date('1999-05-15'),
      email: 'student3@example.com',
      fieldOfStudy: 'Physics',
      name: 'Student 3',
      regNumber: 'REG005',
      facultyName: 'Informatik',
      term: 3,
      username: 'student3',
    },
  })

  // Student 4
  await prisma.student.create({
    data: {
      StudentChoice: {
        create: [
          { lastChange: new Date(), offeredCourseId: 1, points: 150 },
          { lastChange: new Date(), offeredCourseId: 2, points: 250 },
          { lastChange: new Date(), offeredCourseId: 3, points: 200 },
          { lastChange: new Date(), offeredCourseId: 4, points: 100 },
          { lastChange: new Date(), offeredCourseId: 5, points: 300 },
        ],
      },
      birthDate: new Date('1999-05-13'),
      email: 'student4@example.com',
      facultyName: 'Informatik',
      fieldOfStudy: 'Mathematics',
      name: 'Student 4',
      regNumber: 'REG005',
      term: 5,
      username: 'student4',
    },
  })

  // Student 5
  await prisma.student.create({
    data: {
      StudentChoice: {
        create: [
          { lastChange: new Date(), offeredCourseId: 1, points: 200 },
          { lastChange: new Date(), offeredCourseId: 2, points: 150 },
          { lastChange: new Date(), offeredCourseId: 3, points: 250 },
          { lastChange: new Date(), offeredCourseId: 4, points: 200 },
          { lastChange: new Date(), offeredCourseId: 5, points: 200 },
        ],
      },
      birthDate: new Date('1999-03-15'),
      email: 'student5@example.com',
      facultyName: 'Informatik',
      fieldOfStudy: 'Chemistry',
      name: 'Student 5',
      regNumber: 'REG004',
      term: 4,
      username: 'student5',
    },
  })

  // Student 6
  await prisma.student.create({
    data: {
      StudentChoice: {
        create: [
          { lastChange: new Date(), offeredCourseId: 1, points: 300 },
          { lastChange: new Date(), offeredCourseId: 2, points: 200 },
          { lastChange: new Date(), offeredCourseId: 3, points: 100 },
          { lastChange: new Date(), offeredCourseId: 4, points: 200 },
          { lastChange: new Date(), offeredCourseId: 5, points: 200 },
        ],
      },
      birthDate: new Date('1999-05-15'),
      email: 'student6@example.com',
      facultyName: 'Informatik',
      fieldOfStudy: 'Biology',
      name: 'Student 6',
      regNumber: 'REG003',
      term: 3,
      username: 'student6',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
