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
    }
  }
}

export {}
