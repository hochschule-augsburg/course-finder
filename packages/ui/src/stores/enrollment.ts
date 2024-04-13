import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import dummySubjects from './dummySubjects.json'
import { useFiltersStore } from './filters'

export type Meeting = {
  from: string
  to: string
}

// TODO: `?` instead of `null`
export type Subject = {
  cp: number
  description: string
  id: string
  info: string
  maxTnm: number
  meetings: Meeting[] | null
  minTnm: number
  moduleMan: string
  name: string
  prof: string
  selected: boolean
  sws: number
  weekly: Meeting | null
}

export type SubjectProp = keyof Subject

export const useEnrollmentStore = defineStore('enrollment', () => {
  const filtersStore = useFiltersStore()
  const subjects = ref<Subject[]>(dummySubjects)
  const selectedSubjects = computed(() =>
    subjects.value.filter((s) => s.selected),
  )

  const filteredSubjects = computed(() => {
    let filtered: Subject[] = [...subjects.value]
    filtered = filtersStore.applyFilters(filtered)
    filtered = filtersStore.searchSubjects(filtered)
    return filtered
  })

  function enroll() {
    // TODO: api.enroll(selectedSubjects)? Algorithmus?
  }

  return {
    enroll,
    filteredSubjects,
    selectedSubjects,
    subjects,
  }
})
