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

export const i18nInput = z.union([
  z.object({ de: z.string(), en: nullString }),
  z.object({ de: nullString, en: z.string() }),
])
