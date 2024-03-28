import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '../../../api/src/libExports'

import { serverConfig } from '../../../api/src/libExports'

const { url } = serverConfig
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      fetch(url, options) {
        return fetch(url, {
          ...options,
        })
      },
      transformer: superjson,
      url,
    }),
  ],
})
