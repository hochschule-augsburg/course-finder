import type { Course } from '@prisma/client'

import { splitModuleBook } from './split.ts'

export async function parseCourses(pdf: Buffer) {
  const moduleMap = await splitModuleBook(pdf)
  console.debug('extracting data')

  const result = moduleMap.map(([moduleCode, data]) => {
    try {
      return extractData(moduleCode, data)
    } catch (e) {
      console.error(`Error extracting data for module ${moduleCode}`)
      throw e
    }
  })
  return result
}

function extractData(
  moduleCode: string,
  data: {
    buffer: Buffer
    content: string
  },
): Course {
  const lines = data.content.split('\n')

  const [titleDe, titleEn] = parseTitle(lines)
  const faculty = parseFaculty(lines)
  if (!faculty) {
    throw new Error(`Faculty name not found for module ${moduleCode}`)
  }
  const lecturers = parseLecturers(lines)
  const creditPoints = parseCreditPoints(data.content)
  const semesterHours = parseSemesterHours(data.content)
  const exam = parseExam(lines, moduleCode)

  return {
    creditPoints,
    editorUsername: null,
    exam,
    extraInfo: null,
    faculty,
    infoUrl: null,
    lecturers,
    maExam: null,
    maPdf: null,
    moduleCode,
    pdf: data.buffer,
    published: true,
    semesterHours,
    title: {
      de: titleDe ?? titleEn,
      en: titleEn ?? titleDe,
    },
    varyingCP: null,
  }
}

function parseTitle(lines: string[]) {
  const titleIndex = lines.findIndex(
    (e) => e.startsWith('Name / engl.') || e === 'Name',
  )
  const nextTitleIndex = lines.findIndex((e) => e === 'Kürzel' || e === 'Code')
  return lines
    .slice(titleIndex + 1, nextTitleIndex)
    .join(' ')
    .split('/')
    .map((e) => e.trim())
}

function parseFaculty(lines: string[]) {
  const titleIndex = lines.findIndex(
    (e) => e.startsWith('Fakultät') || e.startsWith('Faculty'),
  )
  return lines
    .at(titleIndex + 1)
    ?.replace('Fakultät für ', '')
    .replace('Faculty of Computer Science', 'Informatik')
    .replace('Informatik / Faculty of Computer Science', 'Informatik')
    .replace('Computer Science', 'Informatik')
    .replace('Informatik / Informatik', 'Informatik')
    .trim()
}

function parseLecturers(lines: string[]) {
  const titleIndex = lines.findIndex(
    (e) => e.startsWith('Verantwortlicher') || e.startsWith('Coordinator'),
  )
  const lecturers = []
  for (const line of lines.slice(titleIndex + 1)) {
    if (
      line.startsWith('Fakultät') ||
      line.startsWith('Faculty') ||
      line.startsWith('Lehrsprache') ||
      line.startsWith('Teaching language')
    ) {
      break
    }
    lecturers.push(line.trim())
  }
  return lecturers
}

function parseCreditPoints(content: string) {
  return Number(content.match(/(?:credits|CPs):\s(\d+)/)?.[1])
}
function parseSemesterHours(content: string) {
  return Number(content.match(/(?:Credit hours|SWS):\s(\d+)/)?.[1])
}

function parseExam(lines: string[], moduleCode: string) {
  const titleIndex = lines.findIndex(
    (e) => e.startsWith('Type of exam') || e.startsWith('Prüfungsform'),
  )
  const nextTitleIndex = findIndexFrom(
    lines,
    titleIndex,
    (e) =>
      e === 'Zusätzliche Informationen' ||
      e.startsWith('Module Catalogue »Wahlpflichtfächer«') ||
      e.startsWith('Modulhandbuch »Wahlpflichtfächer«'),
  )

  let exam = ''
  for (const line of lines.slice(titleIndex + 1, nextTitleIndex)) {
    // Workaround for LaTeX quirk.
    if (line.includes(' ') || line.includes(':') || line.includes('\t')) {
      exam += line + '\n'
    } else {
      exam += line + ' '
    }
  }
  exam = exam.trim()
  if (!exam.length) {
    return null
  }
  if (exam.length > 600) {
    console.warn(
      `Exam description for module ${moduleCode} is longer than 600 characters`,
    )
    return null
  }
  return exam
}

function findIndexFrom<T>(lines: T[], from: number, search: (e: T) => boolean) {
  return lines.slice(from + 1).findIndex(search) + from + 1
}
