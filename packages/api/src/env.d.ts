/* eslint-disable perfectionist/sort-interfaces */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_USER?: string
      POSTGRES_PASSWORD?: string
      POSTGRES_HOST?: string
      POSTGRES_PORT?: string
      POSTGRES_DB?: string
      DATABASE_URL?: string

      LDAP_URL?: string
      LDAP_BASE_DN?: string

      FRONTEND_HOSTNAME?: string
      BACKEND_HOSTNAME?: string
    }
  }
}

export {}
