import type { loadExcel } from '@workspace/api/src/domain/phase/loadExcel'

import { assign } from 'lodash-es'
import SuperJSON from 'superjson'

const fastifyRoutes: { [key in keyof FastifyRoutesBody]: RequestInit } = {
  '/admin/courses/upload-module-book': {
    method: 'POST',
  },
  '/admin/enroll/offeredCourses': {
    method: 'POST',
  },
}

type FastifyRoutesBody = {
  '/admin/courses/upload-module-book': FormData
  '/admin/enroll/offeredCourses': FormData
}

type FastifyRoutesResp = {
  '/admin/courses/upload-module-book': object
  '/admin/enroll/offeredCourses': Awaited<ReturnType<typeof loadExcel>>
}

export async function fetchFastify<T extends keyof FastifyRoutesBody>(
  input: T,
  data: FastifyRoutesBody[T],
  init?: Omit<RequestInit, 'body'>,
): Promise<FastifyRoutesResp[T]> {
  const result = await fetch(import.meta.env.VITE_API_URL + 'api' + input, {
    ...assign({}, init, fastifyRoutes[input]),
    body: data,
    credentials: 'include',
  })

  if (!result.ok) {
    throw new Error(result.statusText)
  }

  return SuperJSON.parse(await result.text())
}
