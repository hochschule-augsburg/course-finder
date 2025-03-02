import type { Student } from '@prisma/client'

// https://gitlab.informatik.tha.de/phe/fki-modulhandbuecher/-/blob/master/SharedSources/modules.sty
const examTypesData = [
  {
    keywords: ['Schriftliche Prüfung', 'Klausur', 'Written examination'],
    option: 'filter.ex.written-exam',
  },
  {
    keywords: ['Projektarbeit', 'Project work'],
    option: 'filter.ex.project-work',
  },
  {
    keywords: ['Studienarbeit', 'Written assignment'],
    option: 'filter.ex.written-assignment',
  },
  {
    keywords: ['Präsentation', 'Presentation'],
    option: 'filter.ex.presentation',
  },
  {
    keywords: ['Elektronische Prüfung', 'Electronic examination'],
    option: 'filter.ex.e-written',
  },
  {
    keywords: ['Mündliche Prüfung', 'Oral examination'],
    option: 'filter.ex.oral',
  },
]

export function processCourse<
  T extends { exam: null | string; maExam: null | string },
>(course: T, student: null | Student | undefined): { examTypes: string[] } & T {
  let exam = course.exam
  if (student?.finalDegree === 'Master') {
    exam = course.maExam || course.exam
  }
  const examTypes = examTypesData
    .filter((type) => {
      return type.keywords.find((keyword) => {
        return exam?.includes(keyword)
      })
    })
    .map((e) => e.option)

  return { ...course, examTypes: examTypes }
}
