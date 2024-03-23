import { prisma } from '../../prisma'
import { publicProcedure, router } from '../trpc'

export const postsRouter = router({
  list: publicProcedure.query(async () => await prisma.post.findMany()),
})
