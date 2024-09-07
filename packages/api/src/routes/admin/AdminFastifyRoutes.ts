import type { FastifyInstance } from 'fastify'

import { parseCourses } from '../../domain/module-book/extractData'
import { prisma } from '../../prisma/prisma'

export function adminFastifyRoutes(fastify: FastifyInstance) {
  fastify.post('/api/admin/courses/upload-module-book', async (req, reply) => {
    if (req.cookies['cf-token']) {
      await req.jwtVerify()
    }
    if (req.user?.type !== 'Admin') {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const data = await req.file()

    if (data?.mimetype !== 'application/pdf') {
      return reply
        .status(400)
        .send({ error: 'Invalid file type, only PDFs are allowed' })
    }

    const courses = await parseCourses(await data.toBuffer())
    await prisma.$transaction(
      courses.map((course) => {
        const promise = prisma.course.upsert({
          create: course,
          update: course,
          where: { moduleCode: course.moduleCode },
        })
        promise.catch((e) => {
          console.log(course, e)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return e
        })
        return promise
      }),
    )

    reply.send({ status: 'success' })
  })
  return Promise.resolve()
}
