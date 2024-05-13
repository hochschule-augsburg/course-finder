/* eslint-disable perfectionist/sort-object-types */
import schedule from 'node-schedule'

import type { I18nJson } from '../prisma/PrismaTypes'

import { PhaseService } from './phaseService'

const phaseService = new PhaseService()

export async function startPhaseSchedulingFromDatabase() {
  const phases = await phaseService.getAllPhases()

  phases.forEach((phase) => schedulePhase(phase))
}

// diese Funktion überprüft, ob eine Phase aktiviert ist
function schedulePhase(phase: {
  id: number
  start: Date
  end: Date
  title: I18nJson
  description: I18nJson
}) {
  const phaseStartTime = phase.start
  if (phaseStartTime !== undefined || phaseStartTime !== null) {
    schedule.scheduleJob(phaseStartTime, () => {
      monitorRegistrationCycle(phase)
    })
  }
}

// Funktion zum Aktualisieren des Zeitplans für eine (laufende) Phase
function updatePhaseScheduling(
  phase: {
    id: number
    start: Date
    end: Date
    title: I18nJson
    description: I18nJson
  },
  newStartTime: Date,
  newEndTime: Date,
) {
  const oldStartTime = phase.start
  if (oldStartTime) {
    schedule.cancelJob(oldStartTime.toString())
  }
  phase.start = newStartTime
  phase.end = newEndTime
  schedulePhase(phase)
}

// Funktion zum Löschen des Zeitplans für eine (laufende) Phase und Löschen der Phase aus der Datenbank
function deletePhaseScheduling(phase: {
  id: number
  start: Date
  end: Date
  title: I18nJson
  description: I18nJson
}) {
  const phaseStartTime = phase.start
  if (phaseStartTime) {
    schedule.cancelJob(phaseStartTime.toString()) // Zeitplan für die Phase löschen
  }
  phaseService.deletePhase(phase.id) // Phase aus der Datenbank löschen
}

async function monitorRegistrationCycle(phase: {
  id: number
  start: Date
  end: Date
  title: I18nJson
  description: I18nJson
}) {
  const now = new Date()
  const phaseStartTime = new Date(phase.start)
  const phaseEndTime = new Date(phase.end)
  const warningBeforeEndTime = new Date(
    phaseEndTime.getTime() - 2 * 24 * 60 * 60 * 1000,
  ) // Zwei Tage vor dem Endzeitpunkt
  const drawingTime = new Date(phaseEndTime.getTime() + 1000) // Eine Sekunde nach dem Endzeitpunkt

  // Überprüfen des Status des aktuellen Phasenzyklus
  if (now < phaseStartTime) {
    // console.log(`Phase "${phase.title}" has not started yet.`)
  } else if (now >= phaseStartTime && now < warningBeforeEndTime) {
    console.log(`Phase "${phase.title}" is currently ongoing.`)
    // Hier könnten weitere Aktionen ausgeführt werden
    const phaseName = phase.title.en
    switch (phaseName) {
      case 'Registration':
        // Code für die Registrationsphase
        break
      case 'Email Notification':
        // Code für die E-Mail-Benachrichtigungsphase
        break
      case 'Drawing':
        // Code für die Auslosungsphase
        break
      case 'Finished':
        // Code für die abgeschlossene Phase
        break
      default:
        break
    }
  } else if (now >= warningBeforeEndTime && now < phaseEndTime) {
    console.log(`Warning: Phase "${phase.title}" is ending soon.`)
  } else if (now >= phaseEndTime && now < drawingTime) {
    console.log(`Phase "${phase.title}" has ended. Drawing started.`)
  } else if (now >= drawingTime) {
    console.log(
      `Drawing completed for phase "${phase.title}". Phase cycle finished.`,
    )
  }
}
