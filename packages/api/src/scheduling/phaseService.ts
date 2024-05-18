import type { EnrollPhase, I18nJson } from '../prisma/PrismaTypes'

import { prisma } from '../prisma/prisma'

export class PhaseService {
  /**
   * Creates a new enrollment phase.
   *
   * @param start - The start date of the enrollment phase.
   * @param end - The end date of the enrollment phase.
   * @param title - The title of the enrollment phase in multiple languages.
   * @param description - The description of the enrollment phase in multiple languages.
   * @returns A Promise that resolves to the created enrollment phase.
   */
  async createPhase(
    start: Date,
    end: Date,
    title: I18nJson,
    description: I18nJson,
  ): Promise<EnrollPhase> {
    const createdPhase = await prisma.enrollphase.create({
      data: {
        description,
        end,
        start,
        title,
      },
    })
    return createdPhase
  }

  /**
   * Deletes a phase with the specified ID.
   * @param phaseId - The ID of the phase to delete.
   * @returns A Promise that resolves when the phase is deleted.
   * @throws If an error occurs while deleting the phase.
   */
  async deletePhase(phaseId: number): Promise<void> {
    try {
      await prisma.enrollphase.delete({
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
  async getAllPhases(): Promise<EnrollPhase[]> {
    const phases = await prisma.enrollphase.findMany()
    return phases.map((phase) => ({
      description: phase.description,
      end: phase.end,
      id: phase.id,
      phase: phase.phase,
      start: phase.start,
      title: phase.title,
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
      const updatedPhase = await prisma.enrollphase.update({
        data: {
          description,
          end,
          start,
          title,
        },
        where: { id: phaseId },
      })
      return updatedPhase
    } catch (error) {
      throw new Error(`Failed to update phase with ID ${phaseId}: ${error}`)
    }
  }
}
