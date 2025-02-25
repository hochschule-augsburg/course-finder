import { chunk } from 'lodash-es'
import pdftk from 'node-pdftk'
import { PDFExtract } from 'pdf.js-extract'

export function splitModuleBook(inputFile: Buffer) {
  return extractPDFSections(inputFile)
}

async function extractPDFSections(
  inputFile: Buffer,
): Promise<[moduleCode: string, { buffer: Buffer; content: string }][]> {
  const data = await pdftk.input(inputFile).dumpData().output()
  const lines = data.toString().split('\n')
  const numberOfPages = parseInt(
    lines.find((e) => e.startsWith('NumberOfPages:'))?.split(':')[1] ?? '',
  )
  if (!numberOfPages) {
    throw new Error('numberOfPages not found')
  }
  const startSubjectIndex =
    lines.findIndex((e) => e.startsWith('BookmarkTitle: 2.1')) - 1
  const lastSubjectIndex =
    lines.findLastIndex((e) => e.startsWith('BookmarkTitle: 2.')) + 3

  console.debug('Chapters:')
  console.debug(lines.slice(startSubjectIndex, lastSubjectIndex).join('\n'))

  const moduleBookmarksArrays: {
    bookmarkPageNumber: string
    bookmarkTitle: string
  }[] = chunk(lines.slice(startSubjectIndex, lastSubjectIndex), 4).map((e) => {
    return {
      bookmarkPageNumber: e[3].split(':')[1].trim(),
      bookmarkTitle: e[1].split(':')[1].trim(),
    }
  })

  console.debug('read metadata')

  return Promise.all(
    moduleBookmarksArrays.map(
      async (
        bookmark,
        i,
      ): Promise<[string, { buffer: Buffer; content: string }]> => {
        const start = parseInt(bookmark.bookmarkPageNumber)
        const end = moduleBookmarksArrays[i + 1]
          ? parseInt(moduleBookmarksArrays[i + 1].bookmarkPageNumber) - 1
          : numberOfPages
        const pdfBuffer = await pdftk
          .input(inputFile)
          .cat(`${start}-${end}`)
          .output()
        const pdfContent = await new PDFExtract().extractBuffer(pdfBuffer)
        const content = pdfContent.pages.flatMap((e) =>
          e.content.map((e) => e.str).filter((e) => e.trim()),
        )
        const index = content.findIndex(
          (e) => e.startsWith('Kürzel') || e.startsWith('Code'),
        )

        const moduleCode = content[index + 1].split(',')[0].trim()
        if (!moduleCode) {
          throw new Error(`moduleCode not found (p. ${start}-${end})`)
        }
        return [moduleCode, { buffer: pdfBuffer, content: content.join('\n') }]
      },
    ),
  )
}
