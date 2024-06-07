/* eslint-disable perfectionist/sort-interfaces */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      DEV_DOCKER_DB?: string
    }
  }
}

export {}
