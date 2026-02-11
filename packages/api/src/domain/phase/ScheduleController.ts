import type { Job } from 'node-schedule'

import { scheduleJob } from 'node-schedule'

import { type Enrollphase, PhaseState } from '../../generated/prisma/client.js'
import { prisma } from '../../prisma/prisma.ts'
import { PhaseService } from './PhaseService.ts'

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
        await prisma.enrollphase.update({
          data: { state: PhaseState.OPEN },
          where: { id: phase.id, state: 'NOT_STARTED' },
        })
        console.info('Opening phase', phase.id, 'from scheduled job')
      },
    ),
    scheduleJob(
      `phase-${phase.id}:send-mail`,
      phase.emailNotificationAt,
      async () => {
        await PhaseService.sendReminderMails(phase.id)
        console.info('Sent mail for phase', phase.id, 'from scheduled job')
      },
    ),
    scheduleJob(`phase-${phase.id}:set-drawing`, phase.end, async () => {
      await prisma.enrollphase.update({
        data: { state: PhaseState.DRAWING },
        where: { id: phase.id, state: 'OPEN' },
      })
      console.info('Closing phase', phase.id, 'from scheduled job')
    }),
  ].filter((job) => job !== null)
}
