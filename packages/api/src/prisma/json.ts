/* eslint-disable @typescript-eslint/no-namespace */
import { Faculty, Module } from '@prisma/client'

declare global {
  namespace PrismaJson {
    type I18n = {
      de?: string
      en?: string
    }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function abc(a: Module, b: Faculty) {}
