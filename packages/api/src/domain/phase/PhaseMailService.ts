import { uniqBy } from 'lodash-es'

import type { EnrollPhase } from '../../prisma/PrismaTypes.ts'

import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import { sendEmail } from '../mail/Mail.ts'

export async function sendOpeningMail(phaseId: number) {
  const phase = await prisma.enrollphase.findUnique({
    select: {
      end: true,
      state: true,
      title: true,
    },
    where: { id: phaseId },
  })
  if (!phase) {
    throw new Error('Phase not found')
  }
  if (phase.state !== 'OPEN') {
    throw new Error('Phase is not open')
  }
  await sendEmail(
    env.MAIL_RECEIVERS,
    `${phase.title.de} geöffnet | ${phase.title.en} started`,
    openingMail({
      contactEmail: env.CONTACT_EMAIL,
      dateDe: phase.end.toLocaleString('de-DE', {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'numeric',
        year: 'numeric',
      }),
      dateEn: phase.end.toLocaleString('en-GB', {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'numeric',
        year: 'numeric',
      }),
      url: env.FRONTEND_ORIGIN,
    }),
  )
}

export async function sendReminderMails(phaseId: number) {
  const phase = await prisma.enrollphase.findUnique({
    where: { id: phaseId },
  })
  if (!phase) {
    throw new Error('Phase not found')
  }

  const zeroPointsStudents = await getZeroPointsStudents(phase)
  const zeroCreditsStudents = await getZeroCreditsStudents(phase)

  const unfinishedStudents = uniqBy(
    [...zeroCreditsStudents, ...zeroPointsStudents],
    (e) => e?.Student.User.username,
  )

  await sendEmailsToUnfinishedStudents(unfinishedStudents, phase)

  await sendEmail(
    env.MAIL_RECEIVERS,
    `${phase.title.de} endet bald | ${phase.title.en} will be closing soon`,
    getClosingEmailContent(phase),
  )
}

const studentSelectionData = {
  Student: {
    select: {
      User: {
        select: {
          email: true,
          name: true,
          username: true,
        },
      },
    },
  },
}

async function getZeroPointsStudents(phase: EnrollPhase) {
  const zeroPointChoices = await prisma.studentChoice.findMany({
    select: {
      points: true,
      StudentPhase: {
        select: studentSelectionData,
      },
    },
    where: {
      phaseId: phase.id,
      points: 0,
    },
  })
  return Object.values(
    Object.groupBy(
      zeroPointChoices,
      (e) => e.StudentPhase?.Student.User.username,
    ),
  )
    .filter(
      (choices): choices is NonNullable<typeof zeroPointChoices> =>
        Array.isArray(choices) &&
        choices.every((choice) => choice.points === 0),
    )
    .map((choices) => choices?.[0]?.StudentPhase)
}

async function getZeroCreditsStudents(phase: EnrollPhase) {
  return await prisma.studentPhase.findMany({
    select: studentSelectionData,
    where: {
      creditsNeeded: 0,
      phaseId: phase.id,
    },
  })
}

async function sendEmailsToUnfinishedStudents(
  unfinishedStudents: { Student: { User: { email: string; name: string } } }[],
  phase: EnrollPhase,
) {
  await Promise.all(
    unfinishedStudents.map(async (studentPhase) => {
      await sendEmail(
        studentPhase.Student.User.email,
        `${phase.title.de} unvollständig | ${phase.title.en} incomplete`,
        getReminderEmailContent(studentPhase),
      )
    }),
  )
}

function getReminderEmailContent(studentPhase: {
  Student: { User: { email: string; name: string } }
}) {
  return `Hallo ${studentPhase.Student.User.name},<br>

        deine Wahl ist noch nicht vollständig. Bitte stelle sicher, dass du
        für jedes gewählte Fach eine Priorisierung festgelegt hast und die
        Anmeldung durch das Festlegen der gewünschten Credit Points (CP)
        abgeschlossen ist.<br>

        Du kannst deine Wahl hier korrigieren:<br>
        <a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>

        Eine Anleitung findest du hier:
        <a href="https://hochschule-augsburg.github.io/course-finder/student#_3-2-wahlpflichtfach-anmeldung">Anleitung</a><br>
        ---<br><br>

        Hello ${studentPhase.Student.User.name},<br>

        your choice is still incomplete. Please make sure that you have set a
        prioritization for each selected course and completed the registration
        by setting the desired credit points (CP).<br>

        You can correct your choice here:<br>
        <a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>

        You can find instructions here:
        <a href="https://hochschule-augsburg.github.io/course-finder/student#_3-2-wahlpflichtfach-anmeldung">Instructions</a>
        `
}

function getClosingEmailContent(phase: EnrollPhase) {
  return `Sehr geehrte Studierende,<br>
    die Anmeldung für Wahlpflichtfächer [${phase.title.de}] endet am ${phase.end.toLocaleString(
      'de-DE',
    )}.<br>
    Bitte stelle sicher, dass Du Ersatzwahlen getroffen hast, falls ein Kurs aufgrund der Teilnehmerzahl nicht stattfindet.<br>
    Die Anmeldung erfolgt über folgender Seite:
    <br><a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>
    ---<br><br>

    Dear students,<br>
    Registrations for elective courses (Wahlpflichtfächer) for [${phase.title.en}] will be closing on ${phase.end.toLocaleString(
      'en-GB',
    )}.<br>
    Please make sure you have made backup choices in case a course does not take place due to the number of participants.<br
    Registrations can be made on the following website:<br>
    <a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>`
}

function openingMail(data: {
  contactEmail: string
  dateDe: string
  dateEn: string
  url: string
}): string {
  return `
Sehr geehrte Studierende,<br><br>

zu Beginn des Semesters findet wie immer die Anmeldung für die Wahlpflichtfächer statt.<br><br>

Auf der Website <a href="${data.url}">${data.url}</a> 
können Sie jetzt Ihr Semester planen und sich für die Fächer anmelden, die Sie im kommenden Semester belegen möchten.<br>

Eine Anleitung zur Bedienung finden Sie <a href="https://hochschule-augsburg.github.io/course-finder/student.html">hier</a>.<br><br>

Die Zuteilung der Fächer erfolgt über ein priorisiertes Verfahren. Bitte überlegen Sie sich gut, wie viele Fächer Sie erfolgreich studieren können, 
und melden Sie sich entsprechend an. Planen Sie auch Ersatzfächer ein, falls ein Fach bereits voll ist oder aufgrund zu geringer Teilnehmerzahl ausfällt. 
Geben Sie jedoch nur so viele CP an, wie Sie im kommenden Semester tatsächlich mit Wahlpflichtfächern erreichen möchten (und können). 
Weitere Details finden Sie auf der Anmeldeseite.<br><br>

<b>Die Anmeldung läuft bis ${data.dateDe}.</b><br><br>

Bitte warten Sie nicht bis zum letzten Tag – Sie können Ihre Wahl bis zum Anmeldeschluss jederzeit korrigieren.<br><br>

Jedes Semester gibt es auch interessante Kurse, die <b>nicht</b> über die CourseFinder-Plattform vergeben werden.
Diese werden häufig per E-Mail angekündigt und sind in CourseFinder mit einem "E" für externe Anmeldung gekennzeichnet.<br><br>

Studierende des 1. und 2. Semesters können sich noch nicht für Wahlpflichtfächer eintragen, da sie sich in der Orientierungsphase befinden. 
Sie können jedoch bereits einen Blick auf das Angebot werfen und so für die nächsten Semester planen.<br><br>

Bei Problemen mit der Anmeldung senden Sie bitte eine E-Mail an 
<a href="mailto:${data.contactEmail}">${data.contactEmail}</a>.<br>
<br>

--- <br><br>

Dear Students,<br><br>

At the beginning of the semester, as always, the registration for elective courses takes place.<br><br>

On the website <a href="${data.url}">${data.url}</a> 
you can now plan your semester and register for the courses you would like to take in the upcoming semester.<br>

A guide on how to use the system can be found <a href="https://hochschule-augsburg.github.io/course-finder/student.html">here</a>.<br><br>

The allocation of courses is done through a prioritized procedure. Please carefully consider how many courses you can successfully complete 
and register accordingly. Also, plan for alternative courses in case a course is already full or is canceled due to low enrollment. 
However, only specify as many credit points as you actually intend (and are able) to achieve with elective courses in the upcoming semester. 
Further details can be found on the registration page.<br><br>

<b>Registration is open until ${data.dateEn}.</b><br><br>

Please do not wait until the last day – you can adjust your selection at any time until the registration deadline.<br><br>

Each semester, there are also interesting courses that are not allocated through the CourseFinder platform.
These are often announced via email and are marked with an "E" in CourseFinder for external registration.<br><br>

Students in the 1st and 2nd semesters cannot yet register for elective courses as they are still in the orientation phase. 
However, they can already take a look at the available courses and start planning for future semesters.<br><br>

If you encounter any issues with the registration, please send an email to 
<a href="mailto:${data.contactEmail}">${data.contactEmail}</a>.<br>
`
}
