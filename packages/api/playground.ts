import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { serverConfig } from '../config'
import type { AppRouter } from './src/router'

async function start() {
  const { port, prefix } = serverConfig
  const url = `localhost:${port}${prefix}`
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `http://${url}`,
        transformer: superjson,
        headers: { username: 'nyan' },
      }),
    ],
  })

  // console.log(await trpc.auth.login.query({ username: 'nyan', password: 'nyan' }))
  console.log(JSON.stringify(await trpc.course.getOfferedCourses.query({phaseId: 1}), null, 4))
}

void start()
