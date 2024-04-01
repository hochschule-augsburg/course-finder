import { I18nJson } from '../../prisma/json'

export enum LoginError {
  InvalidCredentials = 0,
  ServiceNotAvailable = 1,
}

export type AuthenticateType =
  | {
      data:
        | {
            birthDate: Date
            faculty: I18nJson
            fieldOfStudy: string
            term: number
            type: 'Student'
            username: string
          }
        | {
            faculty: I18nJson
            type: 'Professor'
            username: string
          }
      ok: true
    }
  | { error?: LoginError; ok: false }
export interface UserService {
  authenticate(username: string, password: string): Promise<AuthenticateType>
}
