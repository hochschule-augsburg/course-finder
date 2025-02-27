import { parseCourses } from '../../src/domain/module-book/extractData'

const urls = {
  ba: 'https://cloud.hs-augsburg.de/index.php/s/e6bYJTCP4JQ5RXj/download/Modulhandbuch_WPF_Bachelor.pdf',
  ba_eng:
    'https://cloud.hs-augsburg.de/index.php/s/X2bK5EG58JLHBTS/download/Modulhandbuch_WPF_Bachelor-ENG.pdf',
  ma: 'https://cloud.hs-augsburg.de/index.php/s/a7TnPfxtmXbxTcD/download/Modulhandbuch_WPF_Master.pdf',
}

describe('Module Book', () => {
  let pdfs: Record<string, Buffer> = {}
  beforeAll(async () => {
    pdfs = Object.fromEntries(
      await Promise.all(
        Object.entries(urls).map(
          async ([key, url]): Promise<[string, Buffer<ArrayBufferLike>]> => {
            const pdf = await fetch(url).then((res) => res.arrayBuffer())
            return [key, Buffer.from(pdf)]
          },
        ),
      ),
    )
  })
  it.skipIf(!process.env.CI).each(Object.keys(urls))(
    'should parse module book from %s',
    async (key) => {
      const out = await parseCourses(pdfs[key])
      expect(out.length).toBeGreaterThan(0)
    },
    30000,
  )
})
