/* eslint-disable no-use-before-define */
/* eslint-disable perfectionist/sort-objects */
import { Phase } from './phase'

class PhaseService {
  private currentPhase: Phase | undefined
  private static instance: PhaseService
  private phaseEndTimes: Record<Phase, Date | undefined> = {
    [Phase.Registration]: undefined,
    [Phase.EmailNotification]: undefined,
    [Phase.Drawing]: undefined,
    [Phase.Finished]: undefined,
    [Phase.Closed]: undefined,
  }

  private phaseStartTimes: Record<Phase, Date | undefined> = {
    [Phase.Registration]: undefined,
    [Phase.EmailNotification]: undefined,
    [Phase.Drawing]: undefined,
    [Phase.Finished]: undefined,
    [Phase.Closed]: undefined,
  }

  private constructor() {
    Object.values(Phase).forEach((phase) => {
      this.phaseStartTimes[phase] = undefined
    })
  }

  static getInstance(): PhaseService {
    if (!PhaseService.instance) {
      PhaseService.instance = new PhaseService()
    }
    return PhaseService.instance
  }

  getCurrentPhase(): Phase | undefined {
    return this.currentPhase
  }

  // Gib die Endzeit einer Phase zurück
  getPhaseEndTime(phase: Phase): Date | undefined {
    return this.phaseEndTimes[phase]
  }

  getPhaseEnum(): typeof Phase {
    return Phase
  }

  getPhaseStartTime(phase: Phase): Date | undefined {
    return this.phaseStartTimes[phase]
  }

  setCurrentPhase(phase: Phase): void {
    this.currentPhase = phase
  }

  setPhaseEndTime(phase: Phase, endTime: Date): void {
    this.phaseEndTimes[phase] = endTime
  }

  setPhaseStartTime(phase: Phase, startTime: Date): void {
    this.phaseStartTimes[phase] = startTime
  }
}

export const phaseService = PhaseService.getInstance()
