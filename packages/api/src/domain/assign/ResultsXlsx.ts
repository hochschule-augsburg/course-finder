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
      Title: `${course.Course.title.de} (${module})`,
      Lecturers: course.Course.lecturers.toSorted().join(', '),
      AssignedCount: assignedStuds.length,
      StudentEmails: emails.join(', '),
      Min: course.minParticipants,
      Max: course.maxParticipants,
      RegistrationCount: registration?._count.moduleCode ?? 0,
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
    Title: `${course.Course.title.de} (${course.moduleCode})`,
    Lecturers: course.Course.lecturers.toSorted().join(', '),
    RegistrationCount:
      registrations.find((e) => e.moduleCode === course.moduleCode)?._count
        .moduleCode ?? 0,
    Min: course.minParticipants,
    Max: course.maxParticipants,
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
        Name: user.name,
        Email: user.email,
        FieldOfStudy: user.Student!.fieldOfStudy,
        Term: user.Student!.term,
        RegNumber: user.Student!.regNumber,
        Username: user.username,
      }
    })
    return [
      {
        Titel: offeredCourse?.Course.title.de ?? 'Unknown',
        ModuleCode: module,
        Dozenten:
          offeredCourse?.Course.lecturers.toSorted().join(', ') ?? 'Unknown',
      },
      studentsData,
    ]
  })

  // Generate Excel workbook
  const workbook = XLSX.utils.book_new()

  const assignmentSheetWs = XLSX.utils.json_to_sheet(assignmentSheet, {
    header: [
      'Titel',
      'Dozenten',
      'StudentEmails',
      'Min',
      'Max',
      'RegistrationCount',
      'AssignedCount',
      'ExtraInfo',
    ],
  })
  assignmentSheetWs['!cols'] = [
    { wch: 30 }, // Title
    { wch: 20 }, // Lecturers
    { wch: 20 }, // StudentEmails
    { wch: 10 }, // Min
    { wch: 10 }, // Max
    { wch: 10 }, // RegistrationCount
    { wch: 10 }, // AssignedCount
    { wch: 50 }, // ExtraInfo
  ]
  const notEnoughSheetWs = XLSX.utils.json_to_sheet(notEnoughSheet, {
    header: [
      'Titel',
      'ModuleCode',
      'Dozenten',
      'RegistrationCount',
      'Min',
      'Max',
    ],
  })
  notEnoughSheetWs['!cols'] = [
    { wch: 30 }, // Title
    { wch: 20 }, // Lecturers
    { wch: 10 }, // RegistrationCount
    { wch: 10 }, // Min
    { wch: 10 }, // Max
  ]
  const studentSheetWs = XLSX.utils.json_to_sheet(StudentSheet, {
    header: [
      'Titel',
      'ModuleCode',
      'Dozenten',
      'Name',
      'Email',
      'FieldOfStudy',
      'Term',
      'RegNumber',
      'Username',
    ],
  })

  XLSX.utils.book_append_sheet(workbook, assignmentSheetWs, `Assignments`)
  XLSX.utils.book_append_sheet(
    workbook,
    notEnoughSheetWs,
    `NotEnoughRegistrations`,
  )
  XLSX.utils.book_append_sheet(workbook, studentSheetWs, `Students`)

  const buffer = new Uint8Array(
    XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    }) as Buffer,
  )

  return buffer
}
