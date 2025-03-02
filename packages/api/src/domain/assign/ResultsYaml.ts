import { sortBy } from 'lodash-es'
import YAML from 'yaml'

import type { EnrollPhase } from '../../prisma/PrismaTypes'

import { prisma } from '../../prisma/prisma.ts'

export async function buildYamlResults(
  phase: EnrollPhase,
  results: { moduleCode: string; username: string }[],
) {
  const moduleToStudent = Object.groupBy(results, (e) => e.moduleCode)
  const students = await prisma.user.findMany({
    select: {
      email: true,
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
  const assignedFormatted = Object.fromEntries(
    sortBy(Object.entries(moduleToStudent), (e) => e[0]).map(
      ([module, assignedStuds]) => {
        if (!assignedStuds) {
          throw new Error('assignedStuds is undefined')
        }
        const emails = assignedStuds.map(
          (stud) => students.find((e) => e.username === stud.username)!.email,
        )
        const course = offeredCourses.find((c) => c.moduleCode === module)!

        return [
          `${course?.Course.title.de} (${course?.moduleCode})`,
          {
            assignedCount: assignedStuds.length,
            extraInfo: course.extraInfo?.replaceAll('\n', ' '),
            lecturers: course.Course.lecturers.toSorted().join(', '),
            max: course.maxParticipants,
            min: course.minParticipants,
            registrationCount:
              registrations.find((e) => e.moduleCode === module)?._count
                .moduleCode ?? 0,
            studentMails: emails.join(', '),
          },
        ]
      },
    ),
  )
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
  const notEnoughFormatted = notEnoughRegistrations.map((course) => {
    return {
      [`${course.Course.title.de} (${course.moduleCode})`]: {
        lecturers: course.Course.lecturers.toSorted().join(', '),
        max: course.maxParticipants,
        min: course.minParticipants,
        registrationCount:
          registrations.find((e) => e.moduleCode === course.moduleCode)?._count
            .moduleCode ?? 0,
      },
    }
  })
  const placesLeft = Object.fromEntries(
    Object.entries(assignedFormatted)
      .filter(([, data]) => data.assignedCount < (data.max ?? Number.MAX_VALUE))
      .map(([module, data]) => [
        module,
        {
          assignedCount: data.assignedCount,
          extraInfo: data.extraInfo,
          lecturers: data.lecturers,
          max: data.max,
          min: data.min,
        },
      ]),
  )
  return YAML.stringify(
    {
      [`Assignments for phase ${phase.title.de}`]: assignedFormatted,
      'Not enough registrations': notEnoughFormatted,
      'Places left': placesLeft,
    },
    {
      lineWidth: -1,
    },
  )
}
