/* eslint-disable @typescript-eslint/no-namespace */

export type I18nJson = {
  de?: string
  en?: string
}
declare global {
  namespace PrismaJson {
    type I18n = I18nJson
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
