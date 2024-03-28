import type { ServerOptions } from './server'

const host = 'localhost'
const port = 2022
const prefix = '/trpc'
export const serverConfig: ServerOptions = {
  port,
  prefix,
  url: `http://${host}:${port}${prefix}`,
}
