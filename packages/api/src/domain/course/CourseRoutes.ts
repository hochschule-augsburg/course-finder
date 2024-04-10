import { prisma } from '../../prisma'
import { publicProcedure, router } from '../../router/trpc'

export const courseRouter = router({
  getCourses: publicProcedure.query(async () => {
    return await prisma.course.findMany({
      include: {
        Faculty: true,
        offeredCourses: true,
      },
    })
  }),
})
