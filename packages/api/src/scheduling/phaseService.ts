/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-objects */
import { PrismaClient } from '@prisma/client'

import type { EnrollPhase, I18nJson } from '../prisma/PrismaTypes'

interface Phase {
  id: number
  start: Date
  end: Date
  title: I18nJson // Hinzugefügt
  description: I18nJson // Hinzugefügt
  // Weitere Eigenschaften je nach Bedarf
}

export class PhaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async createPhase(
    start: Date,
    end: Date,
    title: I18nJson,
    description: I18nJson,
  ): Promise<EnrollPhase> {
    try {
      const createdPhase = await this.prisma.enrollphase.create({
        data: {
          start,
          end,
          title,
          description,
        },
      })
      return createdPhase
    } catch (error) {
      throw new Error(`Failed to create phase: ${error}`)
    }
  }

  async deletePhase(phaseId: number): Promise<void> {
    try {
      await this.prisma.enrollphase.delete({
        where: { id: phaseId },
      })
      console.log(`Phase with ID ${phaseId} deleted successfully.`)
    } catch (error) {
      console.error(`Error deleting phase with ID ${phaseId}:`, error)
      throw error
    }
  }

  async getAllPhases(): Promise<Phase[]> {
    // Hier könntest du die Phasen aus der Datenbank abrufen und zurückgeben
    const phases = await this.prisma.enrollphase.findMany() // Annahme: Prisma-Abfrage, um alle Phasen abzurufen
    return phases.map((phase) => ({
      id: phase.id,
      start: phase.start,
      end: phase.end,
      title: phase.title, // Hinzugefügt
      description: phase.description, // Hinzugefügt
      // Weitere Eigenschaften je nach Bedarf
    }))
  }

  async updatePhase(
    phaseId: number,
    start: Date,
    end: Date,
    title: I18nJson,
    description: I18nJson,
  ): Promise<EnrollPhase> {
    try {
      const updatedPhase = await this.prisma.enrollphase.update({
        where: { id: phaseId },
        data: {
          start,
          end,
          title,
          description,
        },
      })
      return updatedPhase
    } catch (error) {
      throw new Error(`Failed to update phase with ID ${phaseId}: ${error}`)
    }
  }

  // Weitere Methoden zum Erstellen, Aktualisieren und Löschen von Phasen
}
