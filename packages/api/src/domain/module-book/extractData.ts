import type { Course } from '@prisma/client'

import { splitModuleBook } from './split'

function nc(searchRes: RegExpMatchArray | null): string {
  if (searchRes) {
    return searchRes[1]
      .trim()
      .replace('•', '\t•')
      .replace('–', '\t\t–')
      .replace('Fakultät für ', '')
      .replace('Faculty of Computer Science', 'Informatik')
  }
  return ''
}

export async function parseCourses(pdf: Buffer) {
  const moduleMap = await splitModuleBook(pdf)
  console.log('extracting data')

  return Object.entries(moduleMap).map(([moduleCode, data]) => {
    return extractData(moduleCode, data)
  })
}

function extractData(
  moduleCode: string,
  data: {
    buffer: Buffer
    content: string
  },
): Course {
  return {
    creditPoints: parseInt(nc(data.content.match(/(?:credits|CPs):\s(\d+)/))),
    editorUsername: null,
    extraInfo: null,
    facultyName: nc(data.content.match(/[^\s]*(?:Faculty|Fakultät)\s(.+)/)),
    infoUrl: null,
    lecturers: [
      nc(
        data.content.match(
          /(?:Module coordinator|Modulverantwortlicher)\s(.+)/,
        ),
      ),
    ],
    moduleCode,
    pdf: data.buffer,
    published: true,
    semesterHours: parseInt(
      nc(data.content.match(/(?:Credit hours|SWS):\s(\d+)/)),
    ),
    title: {
      de: nc(data.content.match(/Modulbezeichnung\s(.+)/)),
      en: nc(
        data.content.match(/(?:Titel in Englisch|Title in English)\s(.+)/),
      ),
    },
    varyingCP: null,
  }
}
