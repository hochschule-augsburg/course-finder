import { router } from '../trpc'
import { assignRouter } from './assign/AssignRoutes'
import { coursesRoutes } from './courses/AdminCoursesRoutes'
import { enrollRouter } from './enroll/AdminEnrollRoutes'

export const adminRouter = router({
  assign: assignRouter,
  courses: coursesRoutes,
  enroll: enrollRouter,
})

async function emailToStudents(results: Record<string, string[]>) {
  const emails = await getStudentEmails(results)
  // send emails to students
  // emails.forEach((e) =>
  //   sendEmail(
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
  // sendEmail(
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
