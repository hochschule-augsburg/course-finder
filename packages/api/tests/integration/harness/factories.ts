import crypto from 'node:crypto'

import type {
  Course,
  Enrollphase,
  OfferedCourse,
  PhaseState,
  Student,
  User,
} from '../../../src/generated/prisma/client.js'

import { hashPassword } from '../../../src/domain/user/local/password-auth.ts'
import { prisma } from './testDb.ts'

export async function seedAppConf(
  overrides: {
    allowedEnrollmentEmails?: string[]
    hasMinFocuses?: boolean
    mailReceivers?: string[]
    maxCredits?: number
  } = {},
) {
  return await prisma.appConf.upsert({
    create: {
      allowedEnrollmentEmails: overrides.allowedEnrollmentEmails ?? [],
      hasMinFocuses: overrides.hasMinFocuses ?? false,
      id: 'Instance',
      mailReceivers: overrides.mailReceivers ?? [],
      maxCredits: overrides.maxCredits ?? 30,
    },
    update: {
      allowedEnrollmentEmails: overrides.allowedEnrollmentEmails ?? [],
      hasMinFocuses: overrides.hasMinFocuses ?? false,
      mailReceivers: overrides.mailReceivers ?? [],
      maxCredits: overrides.maxCredits ?? 30,
    },
    where: { id: 'Instance' },
  })
}

export interface CreateStudentOptions {
  email?: string
  faculty?: string
  fieldOfStudy?: string
  finalDegree?: PrismaJson.Degrees
  name?: string
  password?: string
  term?: number
  twoFA?: boolean
  username: string
}

export async function seedStudent(options: CreateStudentOptions): Promise<{
  password: string
  student: Student
  user: User
}> {
  const salt = crypto.randomBytes(16).toString('hex')
  const plainPassword = options.password ?? 'password123'
  const hashedPassword = await hashPassword(plainPassword, salt)

  const authData: PrismaJson.Auth = options.twoFA
    ? {
        method: 'local',
        password: hashedPassword,
        salt,
        twoFA: true,
      }
    : {
        method: 'local',
        password: hashedPassword,
        salt,
      }

  const user = await prisma.user.create({
    data: {
      auth: authData,
      email: options.email ?? `${options.username}@hs-augsburg.de`,
      name: options.name ?? `Student ${options.username}`,
      type: 'Student',
      username: options.username,
    },
  })

  const student = await prisma.student.create({
    data: {
      faculty: options.faculty ?? 'Informatik',
      fieldOfStudy: options.fieldOfStudy ?? 'Informatik (Bachelor)',
      finalDegree: options.finalDegree ?? 'Bachelor',
      term: options.term ?? 3,
      username: options.username,
    },
  })

  return { password: plainPassword, student, user }
}

export async function seedCourse(
  overrides: Partial<Course> & { moduleCode: string },
) {
  const { moduleCode, ...rest } = overrides
  return await prisma.course.create({
    data: {
      creditPoints: rest.creditPoints ?? 5,
      exam: rest.exam ?? 'Schriftliche Prüfung',
      faculty: rest.faculty ?? 'Informatik',
      lecturers: rest.lecturers ?? ['Prof. Dr. Muster'],
      moduleCode,
      published: rest.published ?? true,
      semesterHours: rest.semesterHours ?? 4,
      title: rest.title ?? {
        de: `Fach ${moduleCode}`,
        en: `Course ${moduleCode}`,
      },
      ...rest,
    },
  })
}

export async function seedPhase(
  state: PhaseState = 'OPEN',
  overrides: Partial<Enrollphase> = {},
) {
  const now = new Date()
  return await prisma.enrollphase.create({
    data: {
      description: overrides.description ?? {
        de: 'Wahlpflichtfächer Anmeldephase',
        en: 'Elective course enrollment phase',
      },
      end: overrides.end ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      publishedTry: overrides.publishedTry ?? null,
      start: overrides.start ?? new Date(now.getTime() - 24 * 60 * 60 * 1000),
      state,
      title: overrides.title ?? {
        de: 'Anmeldephase WS 25/26',
        en: 'Enrollment Phase WS 25/26',
      },
      ...overrides,
    },
  })
}

export async function seedOfferedCourse(
  phaseId: number,
  moduleCode: string,
  overrides: Partial<OfferedCourse> = {},
) {
  const defaultAppointments: PrismaJson.CourseAppointments = {
    dates: [
      {
        from: '2026-10-01T10:00:00Z',
        to: '2026-10-01T11:30:00Z',
      },
    ],
    type: 'weekly',
  }

  return await prisma.offeredCourse.create({
    data: {
      appointments: overrides.appointments ?? defaultAppointments,
      externalRegistration: overrides.externalRegistration ?? false,
      for: overrides.for ?? ['Informatik (Bachelor)'],
      hideMinParticipants: overrides.hideMinParticipants ?? false,
      maxParticipants: overrides.maxParticipants ?? 30,
      minParticipants: overrides.minParticipants ?? 5,
      moduleCode,
      phaseId,
      ...overrides,
    },
  })
}

export async function seedPhaseAssignment(
  phaseId: number,
  tryNo: number,
  username: string,
  moduleCode: string,
) {
  return await prisma.phaseAssignment.create({
    data: {
      moduleCode,
      phaseId,
      tryNo,
      username,
    },
  })
}
