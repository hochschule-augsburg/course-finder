export type ServerOptions = {
  port: number
  prefix: string
  url: string
}
const host = 'localhost'
const port = 2022
const prefix = '/trpc'
export const serverConfig = {
  port,
  prefix,
  url: `http://${host}:${port}${prefix}`,
}
