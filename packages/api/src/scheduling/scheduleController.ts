import schedule from 'node-schedule'

import { Phase } from './phase'
import { phaseService } from './phaseService'

// diese Funktion überprüft, ob eine Phase aktiviert ist
export async function scheduleRegistration() {
  const phaseStartTime = phaseService.getPhaseStartTime(
    phaseService.getCurrentPhase() || Phase.Registration, // Braucht einen default-Wert(vielleicht "Phase.Closed" für wenn keine Phase aktiviert sein)
  )
  if (phaseStartTime) {
    schedule.scheduleJob(phaseStartTime, () => {
      monitorRegistrationCycle()
    })
  }
}

// hier kann die Phase gestartet werden
// muss noch dynamischer gemacht werden
export async function startScheduling() {
  const registrationStartTime = new Date('2024-05-10T00:00:00')
  const registrationEndTime = new Date('2024-05-10T23:59:59')
  phaseService.setPhaseStartTime(Phase.Registration, registrationStartTime)
  phaseService.setPhaseEndTime(Phase.Registration, registrationEndTime)
}

// muss noch überarbeitet werden
function monitorRegistrationCycle() {
  let currentPhase = phaseService.getCurrentPhase()
  const now = new Date()
  const registrationPhaseEndTime = new Date('2024-05-05T23:59:59')
  const warningBeforeEndTime = new Date(
    registrationPhaseEndTime.getTime() - 2 * 24 * 60 * 60 * 1000,
  ) // Two days before the end time
  const drawingTime = new Date(registrationPhaseEndTime.getTime() + 1000)
  // One second after the end time

  // Check the current registration cycle status
  if (now < warningBeforeEndTime && currentPhase !== Phase.Registration) {
    currentPhase = Phase.Registration
    console.log('Registration phase started.')
  } else if (
    now >= warningBeforeEndTime &&
    now < registrationPhaseEndTime &&
    currentPhase !== Phase.EmailNotification
  ) {
    currentPhase = Phase.EmailNotification
    console.log('Warning before the end of registration phase.')
    // Code for sending emails can be placed here
  } else if (
    now >= registrationPhaseEndTime &&
    now < drawingTime &&
    currentPhase !== Phase.Drawing
  ) {
    currentPhase = Phase.Drawing
    console.log('Registration phase ended. Drawing started.')
    // Code for drawing can be placed here
    // Email
  } else if (now >= drawingTime && currentPhase !== Phase.Finished) {
    currentPhase = Phase.Drawing
    console.log('Drawing completed. Registration cycle finished.')
    // Code for cleanup or further actions can be placed here
  } else if (currentPhase === null) {
    console.log('Registration cycle already finished.')
  }
}
