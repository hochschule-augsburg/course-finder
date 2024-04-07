import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { Subject } from './enrollment'

export type Filter = {
  active: boolean
  filterFn: (subjects: Subject[], high: number, low: number) => Subject[]
  high: number
  low: number
  name: string
}

export const useFiltersStore = defineStore('filters', () => {
  const search = ref<string>('')
  const filters = ref<Filter[]>([
    {
      active: false,
      filterFn: (subjects, high, low) =>
        subjects.filter((s) => s.sws >= low && s.sws <= high),
      high: 20,
      low: 0,
      name: 'SWS',
    },
    {
      active: false,
      filterFn: (subjects, high, low) =>
        subjects.filter((s) => s.cp >= low && s.cp <= high),
      high: 20,
      low: 0,
      name: 'CP',
    },
    {
      active: false,
      filterFn: (subjects, high, low) =>
        subjects.filter((s) => s.maxTnm >= low && s.maxTnm <= high),
      high: 20,
      low: 0,
      name: 'maxTnm',
    },
    {
      active: false,
      filterFn: (subjects, high, low) =>
        subjects.filter((s) => s.minTnm >= low && s.minTnm <= high),
      high: 20,
      low: 0,
      name: 'minTnm',
    },
    {
      active: false,
      filterFn: (subjects, _, __) =>
        subjects.filter(
          (s) => !s.weekly && s.meetings && s.meetings.length > 0,
        ),
      high: 0,
      low: 20,
      name: 'Blockveranstaltungen',
    },
    {
      active: false,
      filterFn: (subjects, high, low) =>
        subjects.filter((s) => {
          const weekDay: number | undefined = s.weekly?.from.getDay()
          if (weekDay) {
            return weekDay >= low && weekDay <= high
          }
          if (s.meetings) {
            // TODO default behaviour: .some() or .every()?
            return s.meetings.some(
              (m) => m.from.getDay() >= low && m.from.getDay() <= high,
            )
          }
          return false
        }),
      high: 0,
      low: 6,
      name: 'Wochentag',
    },
  ])

  const activeFilters = computed(() => filters.value.filter((f) => f.active))

  function applyFilters(subjects: Subject[]): Subject[] {
    const filteredSubjects: Subject[] = []
    activeFilters.value.forEach((filter) => {
      filteredSubjects.push(
        ...filter.filterFn(subjects, filter.high, filter.low),
      )
    })
    return filteredSubjects
  }

  function searchSubjects(filteredSubjects: Subject[]): Subject[] {
    if (!search.value.trim()) {
      return filteredSubjects
    }
    return filteredSubjects.filter(
      (s) =>
        s.name.includes(search.value) ||
        s.prof.includes(search.value) ||
        s.description.includes(search.value),
    )
  }

  function resetFilters() {
    filters.value = filters.value.map((f) => {
      f.active = false
      return f
    })
  }

  function resetSearch() {
    search.value = ''
  }

  return {
    activeFilters,
    applyFilters,
    filters,
    resetFilters,
    resetSearch,
    search,
    searchSubjects,
  }
})
