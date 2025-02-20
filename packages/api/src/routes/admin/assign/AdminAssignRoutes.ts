/* eslint-disable perfectionist/sort-objects */
/* eslint-disable no-underscore-dangle */
import { TRPCError } from '@trpc/server'
import { groupBy, sortBy } from 'lodash-es'
import YAML from 'yaml'
import { z } from 'zod'

import type { EnrollPhase } from '../../../prisma/PrismaTypes.ts'

import { assign } from '../../../domain/assign/AssignmentAlgorithm.ts'
import { sendEmail } from '../../../domain/mail/Mail.ts'
import { phaseService } from '../../../domain/phase/PhaseService.ts'
import { env } from '../../../env.ts'
import { prisma } from '../../../prisma/prisma.ts'
import { adminProcedure, router } from '../../trpc.ts'

export const assignRouter = router({
  assign: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .mutation(async ({ input }) => {
      const currentPhase = await prisma.enrollphase.findUnique({
        where: { id: input.phaseId },
      })
      if (!currentPhase) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid Phase' })
      }
      const results = await assign(currentPhase.id)
      let { tryNo } = (await prisma.phaseAssignment.findFirst({
        orderBy: { tryNo: 'desc' },
        select: { tryNo: true },
        where: { phaseId: currentPhase.id },
      })) ?? { tryNo: -1 }

      tryNo++

      await prisma.phaseAssignment.createMany({
        data: Object.entries(results).flatMap(([student, moduleCodes]) =>
          moduleCodes.map((moduleCode) => ({
            moduleCode,
            phaseId: currentPhase.id,
            tryNo,
            username: student,
          })),
        ),
      })

      const courses: Record<string, { count: number }> = {}

      Object.entries(results).forEach(([_student, moduleCodes]) => {
        moduleCodes.forEach((moduleCode) => {
          if (!courses[moduleCode]) {
            courses[moduleCode] = { count: 0 }
          }
          courses[moduleCode].count++
        })
      })

      return {
        result: sortBy(
          Object.entries(courses).map(([moduleCode, { count }]) => ({
            assignCount: count,
            moduleCode,
          })),
          'moduleCode',
        ),
        tryNo,
      }
    }),
  list: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(
      async ({
        input,
      }): Promise<
        { assignCount: number; moduleCode: string; tryNo: number }[][]
      > => {
        const assignments = await prisma.phaseAssignment.groupBy({
          _count: { moduleCode: true },
          by: ['tryNo', 'moduleCode'],
          orderBy: [{ tryNo: 'asc' }, { moduleCode: 'asc' }],
          where: { phaseId: input.phaseId },
        })

        return Object.values(
          groupBy(
            assignments.map((e) => ({
              assignCount: e._count.moduleCode,
              moduleCode: e.moduleCode,
              tryNo: e.tryNo,
            })),
            'tryNo',
          ),
        )
      },
    ),
  publish: adminProcedure
    .input(z.object({ phaseId: z.number(), tryNo: z.number() }))
    .mutation(async ({ input }) => {
      await Promise.all([
        phaseService.updatePhase(input.phaseId, { state: 'FINISHED' }),
        prisma.enrollphase.update({
          data: {
            publishedTry: input.tryNo,
          },
          where: { id: input.phaseId },
        }),
      ])
      const results = await prisma.phaseAssignment.findMany({
        select: { moduleCode: true, username: true },
        where: { phaseId: input.phaseId, tryNo: input.tryNo },
      })

      const phase = (await prisma.enrollphase.findUnique({
        where: { id: input.phaseId },
      }))!
      await emailToAdmin(phase, results)
      await emailToLists(phase)
      await emailToStudents(phase, results)
    }),
})
export const infos = []

async function emailToStudents(
  phase: EnrollPhase,
  results: { moduleCode: string; username: string }[],
) {
  const studToModule = Object.groupBy(results, (e) => e.username)
  const emails = await getStudentEmails(studToModule)
  const courses = await prisma.course.findMany({
    select: { lecturers: true, moduleCode: true, title: true },
  })

  const formattedResults = Object.fromEntries(
    Object.entries(studToModule).map(([student, modules]) => [
      student,
      Object.fromEntries(
        (['de', 'en'] as const).map((locale) => [
          locale,
          modules
            ?.map((e) => {
              const course = courses.find((c) => c.moduleCode === e.moduleCode)
              if (!course) {
                throw new Error(
                  `Course with moduleCode ${e.moduleCode} not found`,
                )
              }
              return `- ${course?.title[locale]} - ${course.lecturers.join(
                ', ',
              )}`
            })
            .join('<br>'),
        ]),
      ) as { de: string; en: string },
    ]),
  )

  // send emails to students
  void Promise.all(
    Object.entries(emails).map(([username, email]) =>
      sendEmail(
        email,
        `${phase.title['de']} - Results/Ergebnisse`,
        `\
Die Ergebnisse der ${phase.title['de']} wurden veröffentlicht.<br>
Deine Zuweisungen:<br>
${formattedResults[username]['de']}<br><br>
Sie können die Ergebnisse auch auf <a href="${env.FRONTEND_ORIGIN}/results">der Website</a> einsehen.<br>
--<br>
<br><br>
The results of the ${phase.title['en']} have been published.<br>
Your assignments:<br>
${formattedResults[username]['en']}<br><br>
You can also view the results on <a href="${env.FRONTEND_ORIGIN}/results">the website</a>.
      `,
      ),
    ),
  )
}

async function emailToAdmin(
  phase: EnrollPhase,
  results: { moduleCode: string; username: string }[],
) {
  const mails = await prisma.user.findMany({
    select: { email: true },
    where: { type: 'Admin' },
  })

  const txtResults = await buildYamlResults(results, phase)
  for (const mail of mails) {
    await sendEmail(
      mail.email,
      `${phase.title['de']} - Results/Ergebnisse`,
      'Die Wahlpflichtfächer wurden ausgelost.',
      [{ content: txtResults, filename: 'results.yaml' }],
    )
  }
}

async function emailToLists(phase: EnrollPhase) {
  await sendEmail(
    env.MAIL_RECEIVERS,
    `${phase.title['de']} - Results/Ergebnisse`,
    `
Die Ergebnisse der ${phase.title['de']} wurden veröffentlicht.<br>
Sie können die Ergebnisse auf <a href="${env.FRONTEND_ORIGIN}/results">der Website</a> einsehen.<br>
--<br>
<br><br>
The results of the ${phase.title['en']} have been published.<br>
You can view the results on <a href="${env.FRONTEND_ORIGIN}/results">the website</a>.
    `,
  )
}

async function getStudentEmails(
  results: Record<string, unknown>,
): Promise<Record<string, string>> {
  const studentUsers = await prisma.user.findMany({
    where: {
      type: 'Student',
    },
  })
  return Object.fromEntries(
    Object.keys(results).map((entry) => {
      const student = studentUsers.find((s) => s.username === entry)
      const email = student?.email

      if (!email) {
        throw new Error(`Student with username ${entry} not found`)
      }

      return [entry, email]
    }),
  )
}

async function buildYamlResults(
  results: { moduleCode: string; username: string }[],
  phase: EnrollPhase,
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
            lecturers: course.Course.lecturers.toSorted().join(', '),
            studentMails: emails.join(', '),
            assignedCount: assignedStuds.length,
            registrationCount:
              registrations.find((e) => e.moduleCode === module)?._count
                .moduleCode ?? 0,
            min: course.minParticipants,
            max: course.maxParticipants,
            extraInfo: course.extraInfo?.replaceAll('\n', ' '),
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
        registrationCount:
          registrations.find((e) => e.moduleCode === course.moduleCode)?._count
            .moduleCode ?? 0,
        min: course.minParticipants,
        max: course.maxParticipants,
      },
    }
  })
  const placesLeft = Object.fromEntries(
    Object.entries(assignedFormatted)
      .filter(([, data]) => data.assignedCount < (data.max ?? Number.MAX_VALUE))
      .map(([module, data]) => [
        module,
        {
          lecturers: data.lecturers,
          assignedCount: data.assignedCount,
          min: data.min,
          max: data.max,
          extraInfo: data.extraInfo,
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
