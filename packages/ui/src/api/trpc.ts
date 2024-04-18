import type { AppRouter } from '@api/routes/router'

import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import { serverConfig } from '../../../config'

const { url } = serverConfig
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
      transformer: superjson,
      url,
    }),
  ],
})
