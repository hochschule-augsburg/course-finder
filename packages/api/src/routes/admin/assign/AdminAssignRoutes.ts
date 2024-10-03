/* eslint-disable no-underscore-dangle */
import { TRPCError } from '@trpc/server'
import { groupBy, sortBy } from 'lodash-es'
import { z } from 'zod'

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
            count,
            moduleCode,
          })),
          'count',
        ).reverse(),
        tryNo,
      }
    }),
  list: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(
      async ({
        input,
      }): Promise<{ count: number; moduleCode: string; tryNo: number }[][]> => {
        const assignments = await prisma.phaseAssignment.groupBy({
          _count: { moduleCode: true },
          by: ['tryNo', 'moduleCode'],
          orderBy: { tryNo: 'asc' },
          where: { phaseId: input.phaseId },
        })

        return Object.values(
          groupBy(
            assignments.map((e) => ({
              count: e._count.moduleCode,
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
      const groupedResults = groupBy(results, 'username')
      await emailToAdmin(groupedResults)
      await emailToStudents(input.phaseId, groupedResults)
    }),
})

async function emailToStudents(
  phaseId: number,
  results: Record<string, { moduleCode: string }[]>,
) {
  const emails = await getStudentEmails(results)
  const phase = await prisma.enrollphase.findUnique({ where: { id: phaseId } })
  if (!phase) {
    throw new Error(`Phase with id ${phaseId} not found`)
  }
  const courses = await prisma.course.findMany({
    select: { lecturers: true, moduleCode: true, title: true },
  })

  const formattedResults = Object.fromEntries(
    Object.entries(results).map(([student, modules]) => [
      student,
      Object.fromEntries(
        (['de', 'en'] as const).map((locale) => [
          locale,
          modules
            .map((e) => {
              const course = courses.find((c) => c.moduleCode === e.moduleCode)
              if (!course) {
                throw new Error(
                  `Course with moduleCode ${e.moduleCode} not found`,
                )
              }
              return `- ${course?.title[locale]} - ${course.lecturers.join(', ')}`
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

async function emailToAdmin(results: Record<string, { moduleCode: string }[]>) {
  const mail = await prisma.user.findFirst({ where: { type: 'Admin' } })
  if (!mail) {
    throw new Error('No admin found')
  }
  const txtText = constructTxtText(results)
  await sendEmail(
    mail?.email,
    'Wahlpflichtfächer',
    'Die Wahlpflichtfächer wurden ausgelost.',
    [{ content: txtText, filename: 'results.txt' }],
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

function constructTxtText(
  results: Record<string, { moduleCode: string }[]>,
): string {
  let txtText = ''
  // List of modules (A-Z)
  let uniqueModuleCodes: string[] = []
  Object.values(results).forEach((stringArray) =>
    stringArray.forEach((s) => uniqueModuleCodes.push(s.moduleCode)),
  )
  uniqueModuleCodes = Array.from(new Set(uniqueModuleCodes)).sort()
  txtText += 'Stattfindende Module\n\n'
  uniqueModuleCodes.forEach((mc) => (txtText += mc + '\n'))
  // List of allocations (A-Z by username)
  txtText += '\nStudent-Modulcode Zuweisungen\n\n'
  Object.keys(results)
    .sort()
    .forEach((key) => {
      txtText += key + ': '
      results[key].forEach((s) => (txtText += s.moduleCode + ', '))
      txtText += '\n'
    })
  return txtText
}

// for testing functions that are otherwise not exported
export const testGetStudentEmails = { getStudentEmails }
export const testConstructTxtText = { constructTxtText }
