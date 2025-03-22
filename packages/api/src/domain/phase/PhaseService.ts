/**
 * The PhaseService is responsible for managing the phases of the enrollment
 *  process.
 * It manages the scheduling of the phases and provides methods for manipulation.
 */
import { type Enrollphase, PhaseState } from '@prisma/client'
import { groupBy } from 'lodash-es'
import { z } from 'zod'

import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import {
  i18nInput,
  offeredCourseSpec,
  zodEnumFromObjKeys,
} from '../../prisma/PrismaZod.ts'
import { sendEmail } from '../mail/Mail.ts'
import {
  cancelPhase,
  reschedulePhase,
  schedulePhase,
} from './ScheduleController.ts'

export const phaseSpec = z.object({
  description: i18nInput,
  emailNotificationAt: z.date().optional(),
  end: z.date(),
  offeredCourses: z.array(offeredCourseSpec),
  start: z.date(),
  state: zodEnumFromObjKeys(PhaseState).optional(),
  title: i18nInput,
})

export const ACTIVE_PHASE_STATES = ['OPEN', 'DRAWING', 'CLOSED']

type phaseSpecType = z.infer<typeof phaseSpec>

export async function startPhaseSchedulingFromDatabase() {
  const phases = await prisma.enrollphase.findMany()

  phases.forEach((phase) => schedulePhase(phase))
}

async function createPhase(data: phaseSpecType): Promise<Enrollphase> {
  const created = await prisma.enrollphase.create({
    data: {
      description: {
        de: data.description.de ?? data.description.en,
        en: data.description.en ?? data.description.de,
      },
      emailNotificationAt: data.emailNotificationAt,
      end: data.end,
      offeredCourses: {
        create: data.offeredCourses.map((course) => ({
          appointments: course.appointments,
          Course: {
            connect: {
              moduleCode: course.moduleCode,
            },
          },
          extraInfo: course.extraInfo,
          for: { set: course.for },
          maxParticipants: course.maxParticipants,
          minParticipants: course.minParticipants,
          moodleCourse: course.moodleCourse,
        })),
      },
      start: data.start,
      title: {
        de: data.title.de ?? data.title.en,
        en: data.title.en ?? data.title.de,
      },
    },
  })
  schedulePhase(created)
  return created
}

async function deletePhase(phaseId: number): Promise<void> {
  await prisma.enrollphase.delete({
    where: { id: phaseId },
  })
  cancelPhase(phaseId)
}

async function sendReminderMail(phaseId: number) {
  const phase = await prisma.enrollphase.findUnique({
    select: {
      emailNotificationAt: true,
      end: true,
      state: true,
      title: true,
    },
    where: { id: phaseId },
  })
  if (!phase) {
    throw new Error('Phase not found')
  }
  env.FRONTEND_ORIGIN = 'https://course-finder.informatik.tha.de/'
  await sendEmail(
    env.MAIL_RECEIVERS,
    'WPF Anmeldephase endet bald | WPF registrations will be closing soon',
    `Die Anmeldung für Wahlpflichtfächer [${phase.title.de}] endet am ${phase.end.toLocaleString(
      'de-DE',
    )}.<br>
          Bitte stelle sicher, dass Du Ersatzwahlen getroffen hast, falls ein Kurs aufgrund der Teilnehmerzahl nicht stattfindet.<br>
          Die Anmeldung erfolgt über folgender Seite:
          <br><a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>
          <br>
          Registrations for optional courses (Wahlpflichtfächer) for [${phase.title.en}] will be closing on ${phase.end.toLocaleString(
            'en-US',
          )}.<br>
          Please make sure you have made backup choices in case a course does not take place due to the number of participants.<br
          Registrations can be made on the following website:<br>
          <a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>`,
  )
}

async function updatePhase(
  phaseId: number,
  data: Partial<phaseSpecType>,
): Promise<Enrollphase> {
  const originalPhase = await prisma.enrollphase.findUnique({
    where: { id: phaseId },
  })

  const updateOfferedCoursesPromise = data.offeredCourses
    ? await updateOfferedCourses(phaseId, data.offeredCourses)
    : []
  const [updatedPhase] = await Promise.all([
    prisma.enrollphase.update({
      data: {
        description: data.description,
        emailNotificationAt: data.emailNotificationAt,
        end: data.end,
        start: data.start,
        state: data.state,
        title: data.title,
      },
      where: { id: phaseId },
    }),
    ...updateOfferedCoursesPromise,
  ])

  if (
    originalPhase?.start.getTime() !== updatedPhase.start.getTime() ||
    originalPhase?.end.getTime() !== updatedPhase.end.getTime() ||
    originalPhase.emailNotificationAt.getTime() !==
      updatedPhase.emailNotificationAt.getTime()
  ) {
    reschedulePhase(updatedPhase)
  }
  return updatedPhase
}

export const phaseService = {
  createPhase,
  deletePhase,
  sendReminderMail,
  updatePhase,
}

async function updateOfferedCourses(
  phaseId: number,
  data: phaseSpecType['offeredCourses'],
): Promise<Promise<unknown>[]> {
  const originalOfferedCourses = await prisma.offeredCourse.findMany({
    where: { phaseId },
  })
  const deleted = originalOfferedCourses.filter(
    (course) =>
      !data.some((newCourse) => newCourse.moduleCode === course.moduleCode),
  )
  const { newCourses, updatedCourses } = groupBy(data, (course) =>
    originalOfferedCourses.find(
      (oldCourse) => oldCourse.moduleCode === course.moduleCode,
    )
      ? 'updatedCourses'
      : 'newCourses',
  )

  return [
    prisma.offeredCourse.deleteMany({
      where: {
        moduleCode: { in: deleted.map((c) => c.moduleCode) },
        phaseId,
      },
    }),
    ...(newCourses?.map((course) =>
      prisma.offeredCourse.create({
        data: {
          appointments: course.appointments,
          extraInfo: course.extraInfo,
          for: { set: course.for },
          hideMinParticipants: course.hideMinParticipants,
          maxParticipants: course.maxParticipants,
          minParticipants: course.minParticipants,
          moduleCode: course.moduleCode,
          moodleCourse: course.moodleCourse,
          phaseId,
        },
      }),
    ) ?? []),
    ...(updatedCourses?.map((course) =>
      prisma.offeredCourse.update({
        data: {
          appointments: course.appointments,
          externalRegistration: course.externalRegistration,
          extraInfo: course.extraInfo,
          for: { set: course.for },
          hideMinParticipants: course.hideMinParticipants,
          maxParticipants: course.maxParticipants,
          minParticipants: course.minParticipants,
          moodleCourse: course.moodleCourse,
        },
        where: {
          phaseId_moduleCode: {
            moduleCode: course.moduleCode,
            phaseId,
          },
        },
      }),
    ) ?? []),
  ]
}
