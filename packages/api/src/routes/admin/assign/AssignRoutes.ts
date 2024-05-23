import { TRPCError } from '@trpc/server'
import { groupBy, sortBy } from 'lodash-es'
import { z } from 'zod'

import { assign } from '../../../domain/assign/AssignmentAlgorithm'
import { phaseService } from '../../../domain/phase/PhaseService'
import { prisma } from '../../../prisma/prisma'
import { adminProcedure, router } from '../../trpc'
// import { sendEmail } from '../../../domain/mail/Mail'

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
      await phaseService.updatePhase(input.phaseId, { state: 'FINISHED' })
      // TODO send emails
    }),
  sendMails: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(async ({ input }) => {
      const assignments = await prisma.phaseAssignment.findMany({
        where: { phaseId: input.phaseId },
      })
      const results: Record<string, string[]> = {}
      const byUsername = Object.fromEntries(
        Object.entries(groupBy(assignments, (a) => a.username)),
      )
      Object.keys(byUsername).forEach((key) => {
        const modCodes: string[] = []
        byUsername[key].forEach((element) => {
          modCodes.push(element.moduleCode)
        })
        results[key] = modCodes
      })
      emailToStudents(results)
      emailToBeuurle(results)
    }),
})

async function emailToStudents(results: Record<string, string[]>) {
  const emails = await getStudentEmails(results)
  // send emails to students
  // emails.forEach((e) =>
  //   await sendEmail(
  //     e,
  //     'Wahlpflichtfächer',
  //     'Ihre Wahlpflichfächer sind unter [website] einsehbar.\n\nYour optional subjects (WPFs) are ready. You can view them at [website].',
  //     undefined,
  //     undefined,
  //   ),
  // )
  console.log(
    'No e-mails were sent to students, code is commented out (AdminRoutes.ts).\n',
    emails,
  )
}

function emailToBeuurle(results: Record<string, string[]>) {
  const txtText = constructTxtText(results)
  // email schicken, .txt anhaengen (claudia.baeurle@tha.de)
  // await sendEmail(
  //   'claudia.baeurle@tha.de',
  //   'Wahlpflichtfächer',
  //   'Die Wahlpflichtfächer wurden ausgelost. Die Ergebnisse sind auf [website] und im Anhang einsehbar.',
  //   'wpf-ergebnisse.txt',
  //   txtText,
  // )
  console.log(
    'No e-mail was sent to claudia.baeurle, code is commented out (AdminRoutes.ts).\n',
    txtText,
  )
}

async function getStudentEmails(
  results: Record<string, string[]>,
): Promise<string[]> {
  // pull students from db
  const studentUsers = await prisma.user.findMany({
    where: {
      type: 'Student',
    },
  })
  const emails: string[] = []
  Object.keys(results).forEach((entry) => {
    // find email of username
    const student = studentUsers.find((s) => s.username === entry)
    const email = student?.email
    // error handling
    if (email !== undefined) emails.push(email)
    // error: username could not be found
    else if (student === undefined)
      console.log(
        `Error when sending E-mail to student [${entry}]. Student could not be found.`,
      )
    // error: students email is undefined
    else if (email === undefined)
      console.log(
        `Error when sending E-mail to student [${entry}]. E-mail of student is undefined.`,
      )
  })
  return emails
}

function constructTxtText(results: Record<string, string[]>): string {
  let txtText = ''
  // List of modules (A-Z)
  let uniqueModuleCodes: string[] = []
  Object.values(results).forEach((stringArray) =>
    stringArray.forEach((s) => uniqueModuleCodes.push(s)),
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
      results[key].forEach((s) => (txtText += s + ', '))
      txtText += '\n'
    })
  return txtText
}

// for testing functions that are otherwise not exported
export const testGetStudentEmails = { getStudentEmails }
export const testConstructTxtText = { constructTxtText }
