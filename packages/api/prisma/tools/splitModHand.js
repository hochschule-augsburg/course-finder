import { execSync } from 'child_process'
import fs from 'fs'

const [inputFile, pdfLevel] = process.argv.slice(2)

if (!inputFile || !pdfLevel) {
  console.log('Usage: node Extract-PDFSections.js <inputFile> <pdfLevel>')
  process.exit(1)
}

if (!fs.existsSync(inputFile)) {
  console.log(`Error: Input file '${inputFile}' not found.`)
  process.exit(1)
}

let page = 0
let book = 1
let title = ''
let prevTitle = ''
let start, end, level
const pattern = /(?:rzel|Module code)+\r\n\r\n(\S+?)(?:\r\n\r\nModul|,)/
const lines = execSync(`pdftk ${inputFile} dump_data`).toString().split('\n')

await Promise.all(
  lines.map((line) => {
    if (line.match(/^BookmarkTitle:\s+(.*)/)) {
      prevTitle = title
      title = line.match(/^BookmarkTitle:\s+(.*)/)[1].replace(' ', '_')
    } else if (line.match(/^BookmarkLevel:\s+(\d+)/)) {
      level = parseInt(line.match(/^BookmarkLevel:\s+(\d+)/)[1])
    } else if (
      level === parseInt(pdfLevel) &&
      line.match(/^BookmarkPageNumber:\s+(\d+)/)
    ) {
      start = page
      page = parseInt(line.match(/^BookmarkPageNumber:\s+(\d+)/)[1])
      if (start !== 0) {
        end = page - 1
        book++

        let text = execSync(
          `pdftotext -f ${start} -l ${end} ${inputFile} -`,
        ).toString()
        const matches = text.match(pattern)
        const modulKrzl = matches ? matches[1] : 'tmp'

        const outputFile = `${modulKrzl}.pdf`
        console.log(`Creating ${outputFile}`)
        execSync(`pdftk ${inputFile} cat ${start}-${end} output ${outputFile}`)
      }
    }
  }),
)

let text = execSync(`pdftotext -f ${end} -l - ${inputFile} -`).toString()
const matches = text.match(pattern)
const modulKrzl = matches ? matches[1] : 'tmp'

const outputFile = `${modulKrzl}.pdf`
console.log(`Creating ${outputFile}`)
execSync(`pdftk ${inputFile} cat ${page}-end output ${outputFile}`)

console.log('Done')
