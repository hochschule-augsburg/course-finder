/* eslint-disable @typescript-eslint/no-namespace */

import type {
  Enrollphase as Phase,
  Student,
  StudentChoice,
  User,
} from '@prisma/client'

export type I18nJson = {
  de?: string
  en?: string
}

export type EnrollPhase = Phase

export type EnrolledCourse = StudentChoice

export type ClientUser = { auth: { twoFA?: boolean } } & Omit<User, 'auth'>
export type ClientUserExtended = {
  Student?: Student | null
} & ClientUser

type TimeInterval<T> = { from: T; to: T }

export type CourseAppointmentsJson<T> =
  | {
      /**
       * Ignore days, months and years
       */
      dates: TimeInterval<T>[]
      type: 'weekly'
    }
  | {
      dates: TimeInterval<T>[]
      type: 'block' | 'irregular'
    }
declare global {
  namespace PrismaJson {
    type I18n = I18nJson
    type CourseAppointments = CourseAppointmentsJson<string>
    type Auth = { twoFA?: true } & (
      | {
          method: 'ldap'
        }
      | { method: 'local'; password: string; salt: string }
    )
  }
}

export {}
