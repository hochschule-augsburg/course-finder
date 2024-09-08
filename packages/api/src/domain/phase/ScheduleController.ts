import type { Job } from 'node-schedule'

import { type Enrollphase, PhaseState } from '@prisma/client'
import { scheduleJob } from 'node-schedule'

import { env } from '../../env'
import { prisma } from '../../prisma/prisma'
import { sendEmail } from '../mail/Mail'

const phaseJobs: Record<number, Job[] | undefined> = {}

export function cancelPhase(phaseId: number) {
  if (phaseJobs[phaseId]) {
    phaseJobs[phaseId]?.forEach((job) => job.cancel())
    delete phaseJobs[phaseId]
  }
}

export function reschedulePhase(phase: Enrollphase) {
  if (phaseJobs[phase.id]) {
    phaseJobs[phase.id]?.forEach((job) => job.cancel())
    delete phaseJobs[phase.id]
  }
  schedulePhase(phase)
}

export function schedulePhase(phase: Enrollphase) {
  if (phaseJobs[phase.id]) {
    throw new Error(`Phase ${phase.id} is already scheduled`)
  }
  phaseJobs[phase.id] = [
    scheduleJob(
      `phase-${phase.id}:open-registration`,
      phase.start,
      async () => {
        const phaseCurrently = await prisma.enrollphase.findUnique({
          select: { state: true },
          where: { id: phase.id },
        })
        if (phaseCurrently?.state === 'NOT_STARTED') {
          await prisma.enrollphase.update({
            data: { state: PhaseState.OPEN },
            where: { id: phase.id },
          })
        }
      },
    ),
    scheduleJob(
      `phase-${phase.id}:send-mail`,
      phase.emailNotificationAt,
      async () => {
        await sendEmail(
          env.MAIL_RECEIVERS,
          'WPF Anmeldephase endet bald | WPF registrations will be closing soon',
          `Die Anmeldung für Wahlpflichtfächer [${phase.title.de}] endet am ${phase.end.toLocaleDateString(
            'de-DE',
            {
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              month: 'long',
              weekday: 'long',
              year: 'numeric',
            },
          )}.<br>Die Anmeldung erfolgt über folgender Seite:<br><a href="${env.FRONTEND_HOSTNAME}">${env.FRONTEND_HOSTNAME}</a><br><br>Registrations for optional courses (Wahlpflichtfächer) for [${phase.title.en}] will be closing on ${phase.end.toLocaleDateString(
            'en-US',
            {
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              month: 'long',
              weekday: 'long',
              year: 'numeric',
            },
          )}.<br>Registrations can be made on the following website:<br><a href="${env.FRONTEND_HOSTNAME}">${env.FRONTEND_HOSTNAME}</a>`,
        )
      },
    ),
    scheduleJob(`phase-${phase.id}:set-drawing`, phase.end, async () => {
      const phaseCurrently = await prisma.enrollphase.findUnique({
        select: { state: true },
        where: { id: phase.id },
      })
      if (phaseCurrently?.state === 'OPEN') {
        await prisma.enrollphase.update({
          data: { state: PhaseState.DRAWING },
          where: { id: phase.id },
        })
      }
    }),
  ].filter((job) => job !== null)
}
