/* eslint-disable perfectionist/sort-objects */
import { sortBy } from 'lodash-es'
import XLSX from 'xlsx'

import type { EnrollPhase } from '../../prisma/PrismaTypes'

import { prisma } from '../../prisma/prisma.ts'

export async function buildExcelResults(
  phase: EnrollPhase,
  results: { moduleCode: string; username: string }[],
) {
  const moduleToStudent = Object.groupBy(results, (e) => e.moduleCode)

  const students = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      Student: {
        select: {
          faculty: true,
          fieldOfStudy: true,
          regNumber: true,
          term: true,
        },
      },
      username: true,
    },
  })

  const offeredCourses = await prisma.offeredCourse.findMany({
    select: {
      Course: {
        select: {
          creditPoints: true,
          lecturers: true,
          title: true,
        },
      },
      extraInfo: true,
      for: true,
      maxParticipants: true,
      minParticipants: true,
      moduleCode: true,
    },
    where: {
      phaseId: phase.id,
    },
  })

  const registrations = await prisma.studentChoice.groupBy({
    _count: { moduleCode: true },
    by: ['moduleCode'],
    where: {
      OfferedCourse: {
        externalRegistration: false,
      },
      phaseId: phase.id,
    },
  })

  // Assignments Table
  const sortedAssignments = sortBy(Object.entries(moduleToStudent), (e) => e[0])

  const assignmentSheet = sortedAssignments.map(([module, assignedStuds]) => {
    if (!assignedStuds) throw new Error('assignedStuds is undefined')

    const emails = assignedStuds.map(
      (stud) => students.find((e) => e.username === stud.username)!.email,
    )

    const course = offeredCourses.find((c) => c.moduleCode === module)!
    const registration = registrations.find((e) => e.moduleCode === module)

    return {
      Kürzel: module,
      Titel: course.Course.title.de,
      Dozenten: course.Course.lecturers.toSorted().join(', '),
      Minimum: course.minParticipants,
      Maximum: course.maxParticipants,
      'Anzahl Interessenten': registration?._count.moduleCode ?? 0,
      'Anzahl Zugewiesene': assignedStuds.length,
      StudentenEmails: emails.join(', '),
      Zusatzinfo: course.extraInfo ?? '',
    }
  })

  // Not Enough Registrations Table
  const notEnoughRegistrations = await prisma.offeredCourse.findMany({
    orderBy: {
      moduleCode: 'asc',
    },
    select: {
      Course: {
        select: {
          lecturers: true,
          moduleCode: true,
          title: true,
        },
      },
      maxParticipants: true,
      minParticipants: true,
      moduleCode: true,
    },
    where: {
      externalRegistration: false,
      moduleCode: {
        notIn: Object.keys(moduleToStudent),
      },
      phaseId: phase.id,
    },
  })

  const notEnoughSheet = notEnoughRegistrations.map((course) => ({
    Kürzel: course.moduleCode,
    Titel: course.Course.title.de,
    Dozenten: course.Course.lecturers.toSorted().join(', '),
    Minimum: course.minParticipants,
    Maximum: course.maxParticipants,
    'Anzahl Interessenten':
      registrations.find((e) => e.moduleCode === course.moduleCode)?._count
        .moduleCode ?? 0,
  }))

  const StudentSheet = sortedAssignments.flatMap(([module, assignedStuds]) => {
    if (!assignedStuds) {
      return []
    }
    const offeredCourse = offeredCourses.find((c) => c.moduleCode === module)
    const studentsData = assignedStuds.map((stud) => {
      const user = students.find((e) => e.username === stud.username)
      if (!user)
        throw new Error(`User not found for username: ${stud.username}`)

      return {
        Kürzel: module,
        Titel: offeredCourse?.Course.title.de ?? 'Unbekannt',
        Dozenten:
          offeredCourse?.Course.lecturers.toSorted().join(', ') ?? 'Unbekannt',
        Name: user.name,
        Email: user.email,
        Studiengang: user.Student!.fieldOfStudy,
        Semester: user.Student!.term,
        Matrikelnummer: user.Student!.regNumber,
        Benutzername: user.username,
      }
    })
    return [
      {
        Kürzel: module,
        Titel: offeredCourse?.Course.title.de ?? 'Unbekannt',
        Dozenten:
          offeredCourse?.Course.lecturers.toSorted().join(', ') ?? 'Unbekannt',
        Name: '-', // prevent overflowing cell
        Email: '',
        Studiengang: '',
        Semester: '',
        Matrikelnummer: '',
        Benutzername: '',
      },
      ...studentsData,
    ]
  })
  console.log(StudentSheet)

  // Generate Excel workbook
  const workbook = XLSX.utils.book_new()

  const assignmentSheetWs = XLSX.utils.json_to_sheet(assignmentSheet, {
    header: [
      'Kürzel',
      'Titel',
      'Dozenten',
      'Minimum',
      'Maximum',
      'Anzahl Interessenten',
      'Anzahl Zugewiesene',
      'StudentenEmails',
      'Zusatzinfo',
    ],
  })
  assignmentSheetWs['!cols'] = [
    { wch: 13 }, // Kürzel
    { wch: 30 }, // Titel
    { wch: 25 }, // Dozenten
    { wch: 10 }, // Minimum
    { wch: 10 }, // Maximum
    { wch: 20 }, // Anzahl Interessenten
    { wch: 20 }, // Anzahl Zugewiesene
    { wch: 20 }, // StudentenEmails
    { wch: 50 }, // Zusatzinfo
  ]
  const notEnoughSheetWs = XLSX.utils.json_to_sheet(notEnoughSheet, {
    header: [
      'Kürzel',
      'Titel',
      'Dozenten',
      'Minimum',
      'Maximum',
      'Anzahl Interessenten',
    ],
  })
  notEnoughSheetWs['!cols'] = [
    { wch: 13 }, // Kürzel
    { wch: 30 }, // Titel
    { wch: 25 }, // Dozenten
    { wch: 10 }, // Minimum
    { wch: 10 }, // Maximum
    { wch: 20 }, // Anzahl Interessenten
  ]
  const studentSheetWs = XLSX.utils.json_to_sheet(StudentSheet, {
    header: [
      'Kürzel',
      'Titel',
      'Dozenten',
      'Name',
      'Email',
      'Studiengang',
      'Semester',
      'Matrikelnummer',
      'Benutzername',
    ],
  })
  studentSheetWs['!cols'] = [
    { wch: 13 }, // Kürzel
    { wch: 30 }, // Titel
    { wch: 25 }, // Dozenten
    { wch: 30 }, // Name
    { wch: 34 }, // Email
    { wch: 25 }, // Studiengang
    { wch: 10 }, // Semester
    { wch: 15 }, // Matrikelnummer
    { wch: 14 }, // Benutzername
  ]

  XLSX.utils.book_append_sheet(
    workbook,
    assignmentSheetWs,
    `Auslosung pro Modul`,
  )
  XLSX.utils.book_append_sheet(
    workbook,
    notEnoughSheetWs,
    `Nicht Genug Anmeldungen`,
  )
  XLSX.utils.book_append_sheet(workbook, studentSheetWs, `Studenten in Modulen`)

  const buffer = new Uint8Array(
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    }) as Buffer,
  )

  return buffer
}
