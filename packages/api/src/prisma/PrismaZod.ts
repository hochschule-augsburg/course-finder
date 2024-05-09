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

export const i18nInput = z.union([
  z.object({ de: z.string(), en: z.string().optional() }),
  z.object({ de: z.string().optional(), en: z.string() }),
])
