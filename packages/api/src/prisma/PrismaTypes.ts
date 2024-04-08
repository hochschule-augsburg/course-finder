/* eslint-disable @typescript-eslint/no-namespace */

import { Faculty, Prof, Student, User } from '@prisma/client'

export type I18nJson = {
  de?: string
  en?: string
}

export type UserExtended = User & {
  Faculty: Faculty | null
  Prof?: Prof | null
  Student?: Student | null
}

declare global {
  namespace PrismaJson {
    type I18n = I18nJson
    type Auth = (
      | {
          method: 'ldap'
        }
      | { method: 'local'; password: string }
    ) & { twoFA?: true }
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
