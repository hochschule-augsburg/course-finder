/* eslint-disable perfectionist/sort-interfaces */
/* eslint-disable perfectionist/sort-objects */
import { PrismaClient } from '@prisma/client'

import type { EnrollPhase, I18nJson } from '../prisma/PrismaTypes'

interface Phase {
  id: number
  start: Date
  end: Date
  title: I18nJson
  description: I18nJson
}

export class PhaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Creates a new enrollment phase.
   * @param start - The start date of the enrollment phase.
   * @param end - The end date of the enrollment phase.
   * @param title - The title of the enrollment phase in internationalized JSON format.
   * @param description - The description of the enrollment phase in internationalized JSON format.
   * @returns A Promise that resolves to the created enrollment phase.
   * @throws If there is an error while creating the phase.
   */
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

  /**
   * Deletes a phase with the specified ID.
   * @param phaseId - The ID of the phase to delete.
   * @returns A Promise that resolves when the phase is deleted.
   * @throws If an error occurs while deleting the phase.
   */
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

  /**
   * Retrieves all phases from the database.
   * @returns A promise that resolves to an array of Phase objects.
   */
  async getAllPhases(): Promise<Phase[]> {
    const phases = await this.prisma.enrollphase.findMany()
    return phases.map((phase) => ({
      id: phase.id,
      start: phase.start,
      end: phase.end,
      title: phase.title,
      description: phase.description,
    }))
  }

  /**
   * Updates a phase with the specified ID.
   *
   * @param phaseId - The ID of the phase to update.
   * @param start - The start date of the phase.
   * @param end - The end date of the phase.
   * @param title - The title of the phase in I18nJson format.
   * @param description - The description of the phase in I18nJson format.
   * @returns A Promise that resolves to the updated EnrollPhase object.
   * @throws If there was an error updating the phase.
   */
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
}
