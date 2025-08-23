import { exec as execOriginal } from 'child_process'
import { unlink, writeFile } from 'fs/promises'
import { chunk } from 'lodash-es'
import { tmpdir } from 'os'
import { promisify } from 'util'

import { prisma } from '../../prisma/prisma.ts'
const exec = promisify(execOriginal)

const TABLE_COLUMNS = ['Name', 'SWS', 'CP', 'Dozent'] as const
const TABLE_COLUMNS_FOCUS = [
  'Medieninformatik',
  'SW-Engineering',
  'IT-Sicherheit',
  'Technische Informatik',
  'Data Science',
] as const

const TABLE_COLUMNS_LEN = TABLE_COLUMNS.length + TABLE_COLUMNS_FOCUS.length

type CourseFocus = {
  CP: string
  Dozent: string
  focuses: Record<string, string[]>
  Name: string
  SWS: string
}

export async function loadMinFocusPdf(pdfBuffer: Buffer) {
  const dir = tmpdir()
  const pdfPath = `${dir}/min-focus-${Math.random().toFixed(6).slice(2)}.pdf`
  try {
    await writeFile(pdfPath, pdfBuffer)

    const tooLongNames = await getTooLongLines(pdfPath)
    const tableRows = await parseTable(pdfPath, tooLongNames)

    const courses = await prisma.course.findMany({
      select: {
        lecturers: true,
        moduleCode: true,
        title: true,
      },
    })

    const notFoundCourses: CourseFocus[] = []
    const updates = tableRows
      .map((row) => {
        const course = courses.find((course) => course.title.de === row.Name)
        if (!course) {
          notFoundCourses.push(row)
          return undefined
        }
        return prisma.course.update({
          data: {
            minFocus: row.focuses,
          },
          where: { moduleCode: course.moduleCode },
        })
      })
      .filter((e) => !!e)
    await prisma.$transaction([
      ...updates,
      prisma.appConf.updateMany({
        data: { hasMinFocuses: true },
      }),
    ])

    return {
      notFoundCourses,
    }
  } finally {
    await unlink(pdfPath)
  }
}

async function getTooLongLines(pdfPath: string) {
  let pdfLayoutContent = (
    await exec(`pdftotext -layout -enc UTF-8 ${pdfPath} -`)
  ).stdout
  const notesIndex = pdfLayoutContent.indexOf('Anmerkung')
  if (notesIndex !== -1) {
    // Remove everything after "Anmerkungen"
    pdfLayoutContent = pdfLayoutContent.substring(0, notesIndex)
  }
  const layoutLines = pdfLayoutContent.split('\f').flatMap((page) => {
    const splitPage = page.split('\n')
    const swsLine = splitPage.find((line) => line.includes('   SWS '))
    const swsIndex = swsLine ? swsLine.indexOf('SWS') : undefined
    const tableHead = splitPage.findIndex((line) => line.startsWith('Name'))
    if (swsIndex === undefined) {
      throw new Error('Could not find SWS index in PDF layout for a page')
    }
    return splitPage
      .slice(tableHead + 1)
      .filter(
        (line) =>
          line[0] !== ' ' &&
          line[swsIndex] !== undefined &&
          line[swsIndex - 2] !== ' ', // before each column there are two spaces.
      )
      .map((line) => line.slice(0, swsIndex))
  })
  return layoutLines
}

async function parseTable(pdfPath: string, tooLongNames: string[]) {
  let pdfContent = (await exec(`pdftotext -enc UTF-8 ${pdfPath} -`)).stdout
  const notesIndex = pdfContent.indexOf('Anmerkung')
  if (notesIndex !== -1) {
    // Remove everything after "Anmerkungen"
    pdfContent = pdfContent.substring(0, notesIndex)
  }

  const pages = pdfContent.split('\f') // beginning of each page
  const firstPageCells = pages[0].split('\n\n')
  if (
    firstPageCells[0] !== 'Name' &&
    firstPageCells[1] !== 'SWS' &&
    firstPageCells[2] !== 'CP' &&
    firstPageCells[3] !== 'Dozent' &&
    firstPageCells[4] !== 'Medieninformatik' &&
    firstPageCells[5] !== 'SW-Engineering' &&
    firstPageCells[6] !== 'IT-Sicherheit' &&
    firstPageCells[7] !== 'Technische\nInformatik' &&
    firstPageCells[8] !== 'Data Science'
  ) {
    throw new Error('Unexpected PDF format')
  }
  const tableCells = pages
    .flatMap((page) =>
      page
        .split('\n\n')
        .slice(TABLE_COLUMNS_LEN)
        .map((e) => e.trim()),
    )
    .filter((cell) => cell.length)
  const fixedTooLongCells = tableCells.flatMap((cell) => {
    const tooLongName = tooLongNames?.find((name) => cell.includes(name))
    if (tooLongName) {
      const [firstCell, ...otherCells] = cell.split('\n')
      const nextCell = firstCell.replace(tooLongName, '').trim()
      const lastCell = firstCell.replace(nextCell, '').trim()
      return [[lastCell, ...otherCells].join('\n'), nextCell]
    }
    return [cell]
  })
  const tableRawRows = chunk(fixedTooLongCells, TABLE_COLUMNS_LEN)
  const tableRows = tableRawRows.map((row) => {
    const rowData: CourseFocus = {
      CP: '',
      Dozent: '',
      focuses: {},
      Name: '',
      SWS: '',
    }
    row.forEach((cell, index) => {
      if (index > TABLE_COLUMNS.length - 1) {
        const columnName = TABLE_COLUMNS_FOCUS[index - TABLE_COLUMNS.length]
        if (cell === '-') {
          return []
        }
        if (columnName) {
          rowData.focuses[columnName] = cell.split('oder').map((e) => e.trim())
        }
        return
      }
      const columnName = TABLE_COLUMNS[index]
      if (columnName) {
        rowData[columnName] = cell.trim()
      }
    })
    return rowData
  })
  return tableRows.map((row) => ({
    ...row,
    Dozent: row.Dozent.replaceAll('\n', ' '),
    Name: row.Name.replaceAll('\n', ' '),
  }))
}
