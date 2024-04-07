import { UserService } from '../user/UserService'

type IoCTypes = {
  UserService: UserService
}

// Redeclare the scg function to get full Typescript support
declare module 'ioc-service-container' {
  export function scg<T extends keyof IoCTypes, U extends IoCTypes[T]>(id: T): U
}
