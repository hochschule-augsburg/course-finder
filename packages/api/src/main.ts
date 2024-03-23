import { serverConfig } from './config'
import { createServer } from './server'

const server = await createServer(serverConfig)

void server.start()
