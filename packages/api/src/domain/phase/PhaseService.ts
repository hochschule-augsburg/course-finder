/**
 * The PhaseService is responsible for managing the phases of the enrollment
 *  process.
 * It manages the scheduling of the phases and provides methods for manipulation.
 */
import { type Enrollphase, PhaseState } from '@prisma/client'
import { groupBy, uniqBy } from 'lodash-es'
import { z } from 'zod'

import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import {
  i18nInput,
  offeredCourseSpec,
  zodEnumFromObjKeys,
} from '../../prisma/PrismaZod.ts'
import { sendEmail } from '../mail/Mail.ts'
import { openingMail } from './openingMail.ts'
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

export class PhaseService {
  static async createPhase(data: phaseSpecType): Promise<Enrollphase> {
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

  static async deletePhase(phaseId: number): Promise<void> {
    await prisma.enrollphase.delete({
      where: { id: phaseId },
    })
    cancelPhase(phaseId)
  }

  static async sendOpeningMail(phaseId: number) {
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

  static async sendReminderMails(phaseId: number) {
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

    const studData = {
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

    const zeroPointChoices = await prisma.studentChoice.findMany({
      select: {
        points: true,
        StudentPhase: {
          select: studData,
        },
      },
      where: {
        points: 0,
      },
    })

    const zeroPointsStudents = Object.values(
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

    const zeroCreditsStudents = await prisma.studentPhase.findMany({
      select: studData,
      where: {
        creditsNeeded: 0,
      },
    })

    const unfinishedStudents = uniqBy(
      [...zeroCreditsStudents, ...zeroPointsStudents],
      (e) => e?.Student.User.username,
    )

    await Promise.all(
      unfinishedStudents.map(async (studentPhase) => {
        await sendEmail(
          studentPhase.Student.User.email,
          `${phase.title.de} unvollständig | ${phase.title.en} incomplete`,
          `Hallo ${studentPhase.Student.User.name},<br>

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
          `,
        )
      }),
    )

    await sendEmail(
      env.MAIL_RECEIVERS,
      `${phase.title.de} endet bald | ${phase.title.en} will be closing soon`,
      `Sehr geehrte Studierende,<br>
      die Anmeldung für Wahlpflichtfächer [${phase.title.de}] endet am ${phase.end.toLocaleString(
        'de-DE',
      )}.<br>
            Bitte stelle sicher, dass Du Ersatzwahlen getroffen hast, falls ein Kurs aufgrund der Teilnehmerzahl nicht stattfindet.<br>
            Die Anmeldung erfolgt über folgender Seite:
            <br><a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>
            <br>
            Dear students,<br>
            Registrations for optional courses (Wahlpflichtfächer) for [${phase.title.en}] will be closing on ${phase.end.toLocaleString(
              'en-GB',
            )}.<br>
            Please make sure you have made backup choices in case a course does not take place due to the number of participants.<br
            Registrations can be made on the following website:<br>
            <a href="${env.FRONTEND_ORIGIN}">${env.FRONTEND_ORIGIN}</a><br>`,
    )
  }

  static async startPhaseSchedulingFromDatabase() {
    const phases = await prisma.enrollphase.findMany()
    phases.forEach((phase) => schedulePhase(phase))
  }

  static async updateOfferedCourses(
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

  static async updatePhase(
    phaseId: number,
    data: Partial<phaseSpecType>,
  ): Promise<Enrollphase> {
    const originalPhase = await prisma.enrollphase.findUnique({
      where: { id: phaseId },
    })

    const updateOfferedCoursesPromise = data.offeredCourses
      ? await PhaseService.updateOfferedCourses(phaseId, data.offeredCourses)
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
}
