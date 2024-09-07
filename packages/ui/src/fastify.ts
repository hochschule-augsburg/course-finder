import { assign } from 'lodash-es'

const fastifyRoutes: { [key in keyof FastifyRoutesBody]: RequestInit } = {
  '/admin/courses/upload-module-book': {
    method: 'POST',
  },
}

type FastifyRoutesBody = {
  '/admin/courses/upload-module-book': FormData
}

export async function fetchFastify<T extends keyof FastifyRoutesBody>(
  input: T,
  data: FastifyRoutesBody[T],
  init?: Omit<RequestInit, 'body'>,
): Promise<FastifyRoutesBody[T]> {
  const result = await fetch(import.meta.env.VITE_API_URL + 'api' + input, {
    ...assign({}, init, fastifyRoutes[input]),
    body: data,
    credentials: 'include',
  })

  if (!result.ok) {
    throw new Error(result.statusText)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result.json()
}
