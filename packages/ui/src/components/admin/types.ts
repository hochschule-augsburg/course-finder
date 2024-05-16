import type {
  CourseAppointmentsJson,
  I18nJson,
} from '@workspace/api/src/prisma/PrismaTypes'

export type OfferedCourseData = {
  Course: { lecturers: string[]; moduleCode: string; title: I18nJson }
  appointments: CourseAppointmentsJson<Date>
  extraInfo: null | string
  for: string[]
  maxParticipants: null | number
  minParticipants: number
  moodleCourse?: string
}
