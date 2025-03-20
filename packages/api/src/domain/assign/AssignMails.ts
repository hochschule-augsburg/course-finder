import type { EnrollPhase } from '../../prisma/PrismaTypes.ts'

import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import { sendEmail } from '../mail/Mail.ts'

export async function emailToStudents(
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
Sie können die Ergebnisse auch auf <a href="${env.FRONTEND_ORIGIN}results">der Website</a> einsehen.<br>
---<br>
<br><br>
The results of the ${phase.title['en']} have been published.<br>
Your assignments:<br>
${formattedResults[username]['en']}<br><br>
You can also view the results on <a href="${env.FRONTEND_ORIGIN}results">the website</a>.
      `,
      ),
    ),
  )
}

export async function emailToLists(phase: EnrollPhase) {
  await sendEmail(
    env.MAIL_RECEIVERS,
    `${phase.title['de']} - Results/Ergebnisse`,
    `
Die Ergebnisse der ${phase.title['de']} wurden veröffentlicht.<br>
Sie können die Ergebnisse auf <a href="${env.FRONTEND_ORIGIN}results">der Website</a> einsehen.<br>
---<br>
<br><br>
The results of the ${phase.title['en']} have been published.<br>
You can view the results on <a href="${env.FRONTEND_ORIGIN}results">the website</a>.
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
