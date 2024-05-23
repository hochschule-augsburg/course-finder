import type { Job } from 'node-schedule'

import { type Enrollphase, PhaseState } from '@prisma/client'
import { scheduleJob } from 'node-schedule'

import { prisma } from '../../prisma/prisma'

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
          prisma.enrollphase.update({
            data: { state: PhaseState.OPEN },
            where: { id: phase.id },
          })
        }
      },
    ),
    scheduleJob(
      `phase-${phase.id}:send-mail`,
      phase.emailNotificationAt,
      () => {
        // sendMailFactory()
      },
    ),
    scheduleJob(`phase-${phase.id}:set-drawing`, phase.end, async () => {
      const phaseCurrently = await prisma.enrollphase.findUnique({
        select: { state: true },
        where: { id: phase.id },
      })
      if (phaseCurrently?.state === 'OPEN') {
        prisma.enrollphase.update({
          data: { state: PhaseState.DRAWING },
          where: { id: phase.id },
        })
      }
    }),
  ].filter((job) => job !== null)
}
