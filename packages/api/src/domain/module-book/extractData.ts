import type { Course } from '@prisma/client'

import { splitModuleBook } from './split.ts'

// https://cloud.hs-augsburg.de/index.php/s/e6bYJTCP4JQ5RXj/download/Modulhandbuch_WPF_Bachelor.pdf
// https://cloud.hs-augsburg.de/index.php/s/a7TnPfxtmXbxTcD/download/Modulhandbuch_WPF_Master.pdf
// https://cloud.hs-augsburg.de/index.php/s/X2bK5EG58JLHBTS/download/Modulhandbuch_WPF_Bachelor-ENG.pdf

export async function parseCourses(pdf: Buffer) {
  const moduleMap = await splitModuleBook(pdf)
  console.log('extracting data')

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

  return {
    creditPoints,
    editorUsername: null,
    extraInfo: null,
    faculty,
    infoUrl: null,
    lecturers,
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
  const nextTitleIndex = lines.findIndex(
    (e) => e.startsWith('Kürzel') || e.startsWith('Code'),
  )
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
  return lines.at(titleIndex + 1)?.trim()
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
