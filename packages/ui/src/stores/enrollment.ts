import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useFiltersStore } from './filters'

export type Meeting = {
  from: Date
  to: Date
}

export type Subject = {
  cp: number
  description: string
  id: string
  info: string
  maxTnm: number
  meetings: Meeting[] | undefined
  minTnm: number
  moduleMan: string
  name: string
  prof: string
  selected: boolean
  sws: number
  weekly: Meeting | undefined
}

export type SubjectProp = keyof Subject

export const useEnrollmentStore = defineStore('enrollment', () => {
  const filtersStore = useFiltersStore()
  const subjects = ref<Subject[]>([])
  const selectedSubject = ref<number | undefined>(undefined)
  const selectedSubjects = computed(() =>
    subjects.value.filter((s) => s.selected),
  )

  const filteredSubjects = computed(() => {
    let filtered: Subject[] = []
    filtered = filtersStore.applyFilters(subjects.value)
    filtered = filtersStore.searchSubjects(filtered)
    return filtered
  })

  function enroll() {
    // TODO api.enroll(selectedSubjects)? Algorithmus?
  }

  return {
    enroll,
    filteredSubjects,
    selectedSubject,
    selectedSubjects,
    subjects,
  }
})
