import { loadCourses } from '../../src/domain/module-book/loadCourses'
import { prismaMock } from '../setup/prisma'

const urls = {
  ba: 'https://cloud.hs-augsburg.de/index.php/s/e6bYJTCP4JQ5RXj/download/Modulhandbuch_WPF_Bachelor.pdf',
  ba_eng:
    'https://cloud.hs-augsburg.de/index.php/s/X2bK5EG58JLHBTS/download/Modulhandbuch_WPF_Bachelor-ENG.pdf',
  ma: 'https://cloud.hs-augsburg.de/index.php/s/a7TnPfxtmXbxTcD/download/Modulhandbuch_WPF_Master.pdf',
}

describe('Module Book', () => {
  let pdfs: { ba: Buffer; ma: Buffer }
  beforeAll(async () => {
    const pdfEntries = await Promise.all(
      (['ba', 'ma'] as const).map(
        async (key): Promise<[string, Buffer<ArrayBufferLike>]> => {
          const pdf = await fetch(urls[key]).then((res) => res.arrayBuffer())
          return [key, Buffer.from(pdf)]
        },
      ),
    )
    pdfs = Object.fromEntries(pdfEntries) as { ba: Buffer; ma: Buffer }
  })
  it.skipIf(!process.env.CI)(
    'should parse module books',
    async () => {
      prismaMock.course.findMany.mockResolvedValue([])
      prismaMock.course.upsert.mockRejectedValue(null)
      prismaMock.course.deleteMany.mockRejectedValue(null)
      prismaMock.$transaction.mockImplementation(
        () => new Promise((r) => r(null)),
      )

      const out = await loadCourses({ baPdf: pdfs.ba, maPdf: pdfs.ma })
      expect(out.status).toBe('success')
      expect(out.messages).toHaveLength(0)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Promise)]),
      )
    },
    60000,
  )
})
