import type { AppRouter } from '@workspace/api/src/routes/router'

import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

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
      url: import.meta.env.VITE_API_URL + 'api/trpc',
    }),
  ],
})
