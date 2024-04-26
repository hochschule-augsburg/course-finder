/* eslint-disable @typescript-eslint/no-namespace */

import type {
  Faculty,
  Enrollphase as Phase,
  Prof,
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

export type UserExtended = {
  Faculty: Faculty | null
  Prof?: Prof | null
  Student?: Student | null
} & User

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
    // TODO
    type ExamType = {
      additionalInfo?: string
      content: Array<
        {
          helpers: {
            specs: string
            type: 'book' | 'calculator' | 'cheatsheet' | 'open-book'
          }
          percentage: number
        } & (
          | {
              minutes: number
              type: 'written'
            }
          | {
              specs: string
              type: 'seminar-paper'
            }
          | {
              type: 'oral'
            }
          | { specs: string; type: 'presentation' }
          | { specs: string; type: 'project' }
        )
      >
      for: string
    }
  }
}

export {}
