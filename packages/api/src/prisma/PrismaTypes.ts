import type {
  AppConf as PAppConf,
  Course as PCourse,
  OfferedCourse as POfferedCourse,
  Enrollphase as PPhase,
  Student as PStudent,
  StudentChoice as PStudentChoice,
  User as PUser,
} from '@prisma/client'

export type AppConf = Omit<PAppConf, 'id'>

export type ClientUser = Omit<PUser, 'auth'> & { auth: { twoFA?: boolean } }

export type ClientUserExtended = ClientUser & {
  Student?: null | PStudent
}
export type Course = Omit<PCourse, 'pdf'>

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

export type EnrolledCourse = PStudentChoice
export type EnrollPhase = PPhase

/**
 * None should be undefined it just help programming
 */
export type I18nJson = {
  de?: string
  en?: string
}

export type OfferedCourse = Omit<POfferedCourse, 'appointments' | 'phaseId'> & {
  appointments: CourseAppointmentsJson<Date>
}

export type OfferedCourseData = {
  appointments: CourseAppointmentsJson<Date>
  Course: { lecturers: string[]; title: I18nJson }
  externalRegistration: boolean
  extraInfo: null | string
  for: string[]
  hideMinParticipants: boolean
  maxParticipants: null | number
  minParticipants: number
  moduleCode: string
  moodleCourse: null | string
}

type TimeInterval<T> = { from: T; to: T }

declare global {
  namespace PrismaJson {
    type Auth = { twoFA?: true } & (
      | {
          method: 'ldap'
        }
      | { method: 'local'; password: string; salt: string }
    )
    type CourseAppointments = CourseAppointmentsJson<string>
    type Degrees = 'Bachelor' | 'Master'
    type I18n = I18nJson
    type Otp = { expires: number; otp: string }
  }
}

export {}
