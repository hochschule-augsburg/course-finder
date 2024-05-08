import schedule from 'node-schedule'

import { Phase } from './phase'
import { phaseService } from './phaseService'

// diese Funktion überprüft, ob eine Phase aktiviert ist
export async function scheduleRegistration() {
  const phaseStartTime = phaseService.getPhaseStartTime(
    phaseService.getCurrentPhase() || Phase.Closed, // Provide a default value for getCurrentPhase()
  )
  if (
    phaseStartTime !== undefined &&
    phaseService.getCurrentPhase === undefined
  ) {
    schedule.scheduleJob(phaseStartTime, () => {
      monitorRegistrationCycle()
    })
  }
}

// hier kann die Phase gestartet werden
// muss noch dynamischer gemacht werden
export async function startScheduling() {
  phaseService.setCurrentPhase(Phase.Registration)
  const registrationStartTime = new Date('2024-05-10T00:00:00')
  const registrationEndTime = new Date('2024-05-10T23:59:59')
  phaseService.setPhaseStartTime(Phase.Registration, registrationStartTime)
  phaseService.setPhaseEndTime(Phase.Registration, registrationEndTime)
  scheduleRegistration()
}

// muss noch überarbeitet werden
function monitorRegistrationCycle() {
  let currentPhase = phaseService.getCurrentPhase() || Phase.Closed
  const now = new Date()
  const registrationPhaseEndTime =
    phaseService.getPhaseEndTime(currentPhase) || now

  // Check the current registration cycle status
  if (now < registrationPhaseEndTime && currentPhase === Phase.Registration) {
    console.log('Registration phase.')
  } else if (
    (now >= registrationPhaseEndTime && currentPhase === Phase.Registration) ||
    (now < registrationPhaseEndTime && currentPhase === Phase.EmailNotification)
  ) {
    currentPhase = Phase.EmailNotification
    console.log('Email Notification started.')
    // Code for sending emails can be placed here
  } else if (
    (now >= registrationPhaseEndTime &&
      currentPhase === Phase.EmailNotification) ||
    (now < registrationPhaseEndTime && currentPhase === Phase.Drawing)
  ) {
    console.log('Drawing.')
    // Code for E can be placed here
  } else if (
    now >= registrationPhaseEndTime &&
    currentPhase === Phase.Drawing
  ) {
    currentPhase = Phase.Finished
    console.log('Drawing completed. Registration cycle finished.')
    // Code for cleanup or further actions can be placed here
  } else if (currentPhase === null) {
    console.log('Registration cycle already finished.')
  }
}
