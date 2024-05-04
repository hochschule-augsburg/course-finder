/* eslint-disable perfectionist/sort-enums */
import { serverConfig } from '../../config'
import { prisma } from './prisma/prisma'
import { createServer } from './server/server'

enum RegistrationPhases {
  REGISTRATION = 'REGISTRATION',
  WARNING_BEFORE_END = 'WARNING_BEFORE_END',
  DRAWING = 'DRAWING',
  FINISHED = 'FINISHED',
}

async function startRegistrationCycle() {
  let registrationPhase = RegistrationPhases.REGISTRATION

  // Monitor the registration cycle in a loop
  setInterval(() => {
    monitorRegistrationCycle()
  }, 86400000) // Check every 24 hours (86400000 milliseconds)

  function monitorRegistrationCycle() {
    const now = new Date()
    const registrationPhaseEndTime = new Date('2024-05-05T23:59:59')
    const warningBeforeEndTime = new Date(
      registrationPhaseEndTime.getTime() - 2 * 24 * 60 * 60 * 1000,
    ) // Two days before the end time
    const drawingTime = new Date(registrationPhaseEndTime.getTime() + 1000)
    // One second after the end time

    // Check the current registration cycle status
    if (
      now < warningBeforeEndTime &&
      registrationPhase !== RegistrationPhases.REGISTRATION
    ) {
      registrationPhase = RegistrationPhases.REGISTRATION
      console.log('Registration phase started.')
    } else if (
      now >= warningBeforeEndTime &&
      now < registrationPhaseEndTime &&
      registrationPhase !== RegistrationPhases.WARNING_BEFORE_END
    ) {
      registrationPhase = RegistrationPhases.WARNING_BEFORE_END
      console.log('Warning before the end of registration phase.')
      // Code for sending emails can be placed here
    } else if (
      now >= registrationPhaseEndTime &&
      now < drawingTime &&
      registrationPhase !== RegistrationPhases.DRAWING
    ) {
      registrationPhase = RegistrationPhases.DRAWING
      console.log('Registration phase ended. Drawing started.')
      // Code for drawing can be placed here
      // Email
    } else if (
      now >= drawingTime &&
      registrationPhase !== RegistrationPhases.FINISHED
    ) {
      registrationPhase = RegistrationPhases.FINISHED
      console.log('Drawing completed. Registration cycle finished.')
      // Code for cleanup or further actions can be placed here
    }
  }
}

// Start the server
const server = await createServer(serverConfig)
await prisma.$connect()

// Start the registration cycle
startRegistrationCycle()

await server.start()
await prisma.$disconnect()
