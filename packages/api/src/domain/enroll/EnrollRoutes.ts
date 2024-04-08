import { router, studentOnlyProcedure } from '../../router/trpc'

export const enrollRouter = router({
  enroll: studentOnlyProcedure.query(async ({ ctx }) => {
    console.log('enroll student', ctx.user)
  }),
})
