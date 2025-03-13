import type { FastifyInstance } from 'fastify'

import SuperJSON from 'superjson'

import { loadCourses } from '../../domain/module-book/loadCourses.ts'
import { loadExcel } from '../../domain/phase/loadExcel.ts'

export function adminFastifyRoutes(fastify: FastifyInstance) {
  fastify.post('/api/admin/enroll/offeredCourses', async (req, reply) => {
    if (req.cookies['cf-token']) {
      await req.jwtVerify()
    }
    if (req.user?.type !== 'Admin') {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const file = await req.file()

    if (!file) {
      return reply.status(400).send({ error: 'No file uploaded' })
    }

    const res = await loadExcel(await file.toBuffer())

    reply.send(SuperJSON.stringify(res))
  })
  fastify.post('/api/admin/courses/upload-module-book', async (req, reply) => {
    if (req.cookies['cf-token']) {
      await req.jwtVerify()
    }
    if (req.user?.type !== 'Admin') {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    let maPdf: Buffer | undefined
    let baPdf: Buffer | undefined

    const parts = req.parts()
    for await (const part of parts) {
      if (
        part.type === 'file' &&
        (part.fieldname === 'baFile' || part.fieldname === 'maFile')
      ) {
        if (part?.mimetype !== 'application/pdf') {
          return reply
            .status(400)
            .send({ error: 'Invalid file type, only PDFs are allowed' })
        }

        const buffer = await part.toBuffer()
        if (part.fieldname === 'baFile') {
          baPdf = buffer
        } else if (part.fieldname === 'maFile') {
          maPdf = buffer
        }
      }
    }
    const resp = await loadCourses({ baPdf, maPdf })
    reply.send(resp)
  })
}
