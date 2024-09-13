import type {
  AppConf as PAppConf,
  Course as PCourse,
  OfferedCourse as POfferedCourse,
  Enrollphase as PPhase,
  Student as PStudent,
  StudentChoice as PStudentChoice,
  User as PUser,
} from '@prisma/client'

/**
 * None should be undefined it just help programming
 */
export type I18nJson = {
  de?: string
  en?: string
}

export type EnrollPhase = PPhase

export type EnrolledCourse = PStudentChoice
export type AppConf = Omit<PAppConf, 'id'>

export type Course = Omit<PCourse, 'pdf'>

export type ClientUser = { auth: { twoFA?: boolean } } & Omit<PUser, 'auth'>
export type ClientUserExtended = {
  Student?: null | PStudent
} & ClientUser

type TimeInterval<T> = { from: T; to: T }

export type CourseAppointmentsJson<T> =
  | {
      /**
       * exact dates and time
       */
      dates: TimeInterval<T>[]
      type: 'irregular'
    }
  | {
      /**
       * Ignore days, months and years
       */
      dates: TimeInterval<T>[]
      type: 'weekly'
    }
  | {
      /**
       * ignore time
       */
      dates: TimeInterval<T>[]
      type: 'block'
    }

export type OfferedCourse = {
  appointments: CourseAppointmentsJson<Date>
} & Omit<POfferedCourse, 'appointments' | 'phaseId'>

declare global {
  namespace PrismaJson {
    type Otp = { expires: number; otp: string }
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
