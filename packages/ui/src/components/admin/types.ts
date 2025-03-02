import type {
  CourseAppointmentsJson,
  I18nJson,
} from '@workspace/api/src/prisma/PrismaTypes'

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
