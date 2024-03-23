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

  let response: any = await trpc.posts.create.mutate({ title: 'Hello' })
  response = await trpc.posts.list.query()

  console.log('>>> ', response)

  await trpc.posts.reset.mutate()
}

void start()
