import { isEqual } from 'lodash-es'

import type { Course } from '../../generated/prisma/client.js'

import { prisma } from '../../prisma/prisma.ts'
import { parseCourses } from './parseModuleBook.ts'

/**
 * Loads courses from provided PDFs and updates the database accordingly.
 * No longer existing courses/otherwise created are marked as unpublished.
 */
export async function loadCourses(pdfs: { baPdf?: Buffer; maPdf?: Buffer }) {
  const messages: string[] = []

  const courseFiles = {
    baCourses: pdfs.baPdf ? await parseCourses(pdfs.baPdf) : [],
    maCourses: pdfs.maPdf ? await parseCourses(pdfs.maPdf) : [],
  }

  const baMaCourses = createMaBaCourses(
    courseFiles.baCourses,
    courseFiles.maCourses,
  )

  messages.push(...checkDifferences(baMaCourses))

  const dupFree = [
    ...(courseFiles.baCourses ?? []),
    ...(courseFiles.maCourses ?? []),
  ].filter(
    (course) => !baMaCourses.find(([a]) => a.moduleCode === course.moduleCode),
  )

  const mergedBaMa = baMaCourses.map(([a, b]) => mergeBaMa(a, b))

  const courses: Course[] = [...dupFree, ...mergedBaMa]

  const oldCourses = await prisma.course.findMany({
    select: { moduleCode: true },
  })
  const notFoundCourses = oldCourses.filter(
    (oldCourse) =>
      !courses.find((course) => oldCourse.moduleCode === course.moduleCode),
  )

  await prisma.$transaction([
    ...courses.map((course) => {
      const promise = prisma.course.upsert({
        create: course,
        update: course,
        where: { moduleCode: course.moduleCode },
      })
      promise.catch((e) => {
        console.error(course, e)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return e
      })
      return promise
    }),
    prisma.course.updateMany({
      data: {
        published: false,
      },
      where: {
        moduleCode: { in: notFoundCourses.map((e) => e.moduleCode) },
      },
    }),
    prisma.appConf.updateMany({
      data: { moduleBookLastUpdated: new Date() },
    }),
  ])

  return { messages: messages, status: 'success' }
}

function checkDifferences(maBaCourses: [Course, Course][]): string[] {
  const messages: string[] = []
  for (const [a, b] of maBaCourses) {
    const differences = Object.keys(a).reduce(
      (diff, key) => {
        if (
          !['exam', 'pdf'].includes(key) &&
          //@ts-expect-error keys are from obj
          !isEqual(a[key], b[key])
        ) {
          diff[key] =
            //@ts-expect-error keys are from obj
            { a: a[key], b: b[key] }
        }
        return diff
      },
      {} as Record<string, { a: unknown; b: unknown }>,
    )
    const differencesEntries = Object.entries(differences)
    if (differencesEntries.length > 0) {
      messages.push(
        `Module ${a.moduleCode} has unsupported differences in master ${differencesEntries
          .map(
            ([key, { a, b }]) =>
              `${key} (${JSON.stringify(a)} vs ${JSON.stringify(b)})`,
          )
          .join(', ')}`,
      )
    }
  }
  return messages
}

function createMaBaCourses(
  baCourses: Course[],
  maCourses: Course[],
): [Course, Course][] {
  const maBaCourses: [Course, Course][] = []
  for (const a of baCourses) {
    for (const b of maCourses) {
      if (a.moduleCode === b.moduleCode) {
        maBaCourses.push([a, b])
      }
    }
  }
  return maBaCourses
}

function mergeBaMa(ba: Course, ma: Course): Course {
  const course = {
    ...ba,
  }
  course.maExam = ma.exam
  course.maPdf = ma.pdf
  return course
}
