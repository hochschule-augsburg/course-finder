/* eslint-disable perfectionist/sort-interfaces */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string

      LDAP_URL?: string
      LDAP_BASE_DN?: string

      FRONTEND_HOSTNAME?: string

      // 32 characters long
      SESSION_SECRET?: string

      SERVER_HOSTNAME?: string
      SERVER_PORT?: string

      MAIL_RECEIVERS?: string
    }
  }
}

export {}
