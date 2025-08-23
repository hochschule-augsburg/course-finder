import { z } from 'zod'

export const jsonAppointmentsSpec = z.object({
  dates: z.array(
    z.object({
      from: z.date().transform((d) => d.toISOString()),
      to: z.date().transform((d) => d.toISOString()),
    }),
  ),
  type: z.union([
    z.literal('weekly'),
    z.literal('block'),
    z.literal('irregular'),
  ]),
})

export const nullString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v?.trim() ? v : undefined))
  .optional()

export const i18nInput = z.object({ de: nullString, en: nullString })

export const offeredCourseSpec = z.object({
  appointments: jsonAppointmentsSpec,
  externalRegistration: z.boolean().optional(),
  extraInfo: nullString,
  for: z.array(z.string()),
  hideMinParticipants: z.boolean().optional(),
  maxParticipants: z.number().nullable().optional(),
  minParticipants: z.number(),
  moduleCode: z.string(),
  moodleCourse: nullString,
})

export function zodEnumFromObjKeys<T extends Record<string, unknown>>(obj: T) {
  const keys = Object.keys(obj) as Extract<keyof T, string>[]
  return z.enum(
    keys as [Extract<keyof T, string>, ...Extract<keyof T, string>[]],
  )
}
