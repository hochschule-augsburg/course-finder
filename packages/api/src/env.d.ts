/* eslint-disable perfectionist/sort-interfaces */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string

      LDAP_URL?: string
      LDAP_BASE_DN?: string

      FRONTEND_HOSTNAME?: string

      // For development. Ldap and other services are mocked
      MOCK_SERVICES?: boolean
    }
  }
}

export {}
