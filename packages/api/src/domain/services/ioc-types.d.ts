import type { LdapService } from './domain/ldap/LdapService'

type IoCTypes = {
  LdapService: LdapService
}

// Redeclare the scg function to get full Typscript support
declare module 'ioc-service-container' {
  export function scg<T extends keyof IoCTypes, U extends IoCTypes[T]>(id: T): U
}
