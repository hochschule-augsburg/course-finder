import XLSX from '@e965/xlsx'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { parse } from 'date-fns'
import { de } from 'date-fns/locale'
import { chunk, template, uniqBy } from 'lodash-es'
import { z, ZodError } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

import type { I18nJson, OfferedCourseData } from '../../prisma/PrismaTypes.ts'

import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import {
  jsonAppointmentsSpec,
  offeredCourseSpec,
} from '../../prisma/PrismaZod.ts'
import { fieldsOfStudy } from '../enroll/enrollUtils.ts'

const genAi = new GoogleGenerativeAI(env.AI_API_KEY)

const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash' })

class DateError extends Error {
  constructor(str: string) {
    super(`Invalid date format: ${str}`)
  }
}

export async function loadExcel(file: Buffer) {
  const courses = await prisma.course.findMany({
    select: { lecturers: true, moduleCode: true, title: true },
  })
  const minCourses = courses.map((e) => ({
    lecturers: e.lecturers[0],
    moduleCode: e.moduleCode,
    title: e.title.de ?? e.title.en ?? 'ERROR',
  }))

  const workbook = XLSX.read(file)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const sheetJson: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet)
  const partIndices = sheetJson
    .map((e, i): [unknown, number] => [e, i])
    .filter(([e]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const keys = Object.keys(e as any)
      return keys.length === 1 && keys.includes('Fach')
    })
    .map(([, i]) => i)

  const parts = partIndices
    .map((start, i) => {
      const end = partIndices[i + 1] ?? sheetJson.length
      return sheetJson.slice(start, end)
    })
    .filter((e) => e.length > 1)
  parts.unshift(sheetJson.slice(0, partIndices[0]))

  const errors: string[] = []
  const offeredCourses: OfferedCourseData[] = []

  await Promise.all(
    parts.flatMap((e) =>
      chunk(e, 10).flatMap(async (chunk) => {
        try {
          const res = await parseCourses(chunk, courses, minCourses)
          offeredCourses.push(...res.offeredCourses)
          errors.push(...res.errors)
        } catch {
          try {
            const res = await parseCourses(chunk, courses, minCourses)
            offeredCourses.push(...res.offeredCourses)
            errors.push(...res.errors)
          } catch (err) {
            if (err instanceof Error && 'message' in err) {
              errors.push(`${err.message} ${JSON.stringify(chunk)}`)
            }
          }
        }
      }),
    ),
  )

  const uniqueCourses = uniqBy(offeredCourses, 'moduleCode')
  const removedCourses = offeredCourses.filter(
    (course) => !uniqueCourses.includes(course),
  )
  removedCourses.forEach((course) => {
    errors.push(`Duplicate course removed: ${course.moduleCode}`)
  })

  return {
    errors,
    offeredCourses: uniqueCourses,
  }
}

async function parseCourses(
  data: Record<string, string>[],
  courses: { lecturers: string[]; moduleCode: string; title: I18nJson }[],
  coursesMin: { lecturers: string; moduleCode: string; title: string }[],
) {
  const prompt = promptTemplate({
    courses: JSON.stringify(coursesMin),
    data: JSON.stringify(data),
  })
  const chatSession = model.startChat({
    generationConfig: { responseMimeType: 'application/json' },
  })
  const res = await chatSession.sendMessage(prompt)
  const resStr = res.response.text()
  const resJson = JSON.parse(resStr) as object[]
  const offeredCourses: OfferedCourseData[] = []
  const errors: string[] = []

  resJson.forEach((e) => {
    try {
      const spec = offeredCourseSpec.extend({
        appointments: jsonAppointmentsSpec.extend({
          dates: z.array(
            z.object({
              from: z.string().transform((e) => parseDate(e)),
              to: z.string().transform((e) => parseDate(e)),
            }),
          ),
        }),
      })
      const offeredCourse = spec.parse(e)
      const course = courses.find(
        (c) => c.moduleCode === offeredCourse.moduleCode,
      )
      if (!course) {
        return errors.push(
          `Course with moduleCode ${offeredCourse.moduleCode} not found`,
        )
      }

      const fieldsNotFound = offeredCourse.for.filter((f) => !fieldsOfStudy[f])
      if (fieldsNotFound.length > 0) {
        return errors.push(
          ...fieldsNotFound.map((e) => `Field of study ${e} not found`),
        )
      }

      offeredCourses.push({
        ...offeredCourse,
        Course: course,
        externalRegistration: !!offeredCourse.externalRegistration,
        extraInfo: offeredCourse.extraInfo ?? null,
        hideMinParticipants: !!offeredCourse.hideMinParticipants,
        maxParticipants: offeredCourse.maxParticipants ?? null,
        moodleCourse: offeredCourse.moodleCourse ?? null,
      })
    } catch (err) {
      //@ts-expect-error hinting
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hint = e?.moduleCode
      if (err instanceof ZodError) {
        return errors.push(`${hint} ${err.message}`)
      }
      if (err instanceof DateError) {
        return errors.push(`${hint} ${err.message}`)
      }
      throw err
    }
  })

  return { errors, offeredCourses }
}

function parseDate(dateStr: string): Date {
  if (dateStr.includes('|')) {
    let parsed = parse<Date, Date>(dateStr, 'EEEEEE | HH:mm', new Date())
    if (!parsed || isNaN(parsed.getTime())) {
      parsed = parse<Date, Date>(dateStr, 'EEEEEE | HH:mm', new Date(), {
        locale: de,
      })

      if (!parsed || isNaN(parsed.getTime())) {
        throw new DateError(dateStr)
      }
    }
    return parsed
  }
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) {
    throw new DateError(dateStr)
  }
  return parsed
}

const promptTemplate: (data: { courses: string; data: string }) => string =
  template(`\
Transformiere die Daten "data" von einer Excel-Tabelle für angebotene Kurse in
 ein Array von JSON-Objekten, die dem JSON-Schema entsprechen. Es gibt auch
 Zeilen die Zusatzinformationen enthalten, die in "extraInfo" gespeichert werden
 können. Daher muss nicht jede Zeile aus ein Json-Objekt erzeugen.
JSON-Schema:
"""
${JSON.stringify(zodToJsonSchema(offeredCourseSpec))}
"""
"externalRegistration" ist für Kurse bei denen man sich nicht über die Plattform
 anmelden kann, sondern z.B. direkt bei den Professoren.
Hinweise können in common-mark in "extraInfo" hinterlegt werden.
"for" sind die Studiengänge für die das Fach angeboten wird, diese werden als
 langform angegeben.
Gibt "from" und "to" im Format "EEEEEE | HH:mm" für "weekly" an, für "block" und "irregular"
 in ISO-Dates EEEEEE eines von [Mo, Tu, We, Th, Fr, Sa, Su].
Falls unsicher bei Booleans, benutze "false". Versuche, dem JSON-Schema zu entsprechen.
Wenn keine minimale Teilnehmerzahl angegeben ist wähle "16" und setze "hideMinParticipants"
 auf "true".
data:
"""
<%= data %>
"""
Kurse:
"""
<%= courses %>
"""
Studiengänge:
"""
${JSON.stringify(fieldsOfStudy)}
"""
SE ist "Systems Engineering (Bachelor)" II ist "International Information Systems (Bachelor)"
`)
