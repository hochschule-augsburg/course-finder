import type { Course } from '@prisma/client'

import { splitModuleBook } from './split.ts'

export async function parseCourses(pdf: Buffer) {
  const moduleMap = await splitModuleBook(pdf)
  console.log('extracting data')

  const result = moduleMap.map(([moduleCode, data]) => {
    return extractData(moduleCode, data)
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
  //@ts-expect-error only for this phase
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [titleDe, titleEn] = getData(
    lines.findIndex(
      (e) => e.startsWith('Name / engl.') || e.startsWith('engl. Name'),
    ),
    lines,
  )?.split('/')
  const facultyName = getData(
    lines.findIndex((e) => e.startsWith('Fakultät') || e.startsWith('Faculty')),
    lines,
  )
    ?.replace('Fakultät für ', '')
    .replace('Faculty of Computer Science', 'Informatik')
    .replace('Informatik / Faculty of Computer Science', 'Informatik')
    .replace('Computer Science', 'Informatik')
    .replace('Informatik / Informatik', 'Informatik')
  if (!facultyName) {
    throw new Error(`Faculty name not found for module ${moduleCode}`)
  }

  const lecturers = getLecturer(
    lines.findLastIndex(
      (e) => e.startsWith('Verantwortlicher') || e.startsWith('Coordinator'),
    ),
    lines,
  )

  return {
    creditPoints: parseInt(nc(data.content.match(/(?:credits|CPs):\s(\d+)/))),
    editorUsername: null,
    extraInfo: null,
    facultyName,
    infoUrl: null,
    lecturers,
    moduleCode,
    pdf: data.buffer,
    published: true,
    semesterHours: parseInt(
      nc(data.content.match(/(?:Credit hours|SWS):\s(\d+)/)),
    ),
    title: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      de: titleDe ?? titleEn,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      en: titleEn ?? titleDe,
    },
    varyingCP: null,
  }
}

function getData(titleIndex: number, lines: string[]) {
  if (titleIndex !== -1) {
    return lines[titleIndex + 1]?.trim()
  }
}

function getLecturer(titleIndex: number, lines: string[]) {
  const lecturers = []
  for (const line of lines.slice(titleIndex + 1)) {
    if (line.startsWith('Fakultät') || line.startsWith('Faculty')) {
      break
    }
    lecturers.push(line)
  }
  return lecturers
}

function nc(searchRes: null | RegExpMatchArray): string {
  if (searchRes) {
    return searchRes[1]
      .trim()
      .replace('•', '\t•')
      .replace('–', '\t\t–')
      .replace('Fakultät für ', '')
      .replace('Faculty of Computer Science', 'Informatik')
      .replace('Informatik / Faculty of Computer Science', 'Informatik')
      .replace('Computer Science', 'Informatik')
      .replace('Informatik / Informatik', 'Informatik')
      .trim()
  }
  return ''
}
