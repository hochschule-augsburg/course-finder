import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { serverConfig } from './src/config'
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

  const a = await trpc.posts.list.query()
  console.log(a)
}

void start()
