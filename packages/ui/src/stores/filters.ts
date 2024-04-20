import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Subject } from './enrollment'

export type Options = {
  option: string
  selected: boolean
}

export type OptionsFilter = {
  filterFn: (subjects: Subject[], options: Options[]) => Subject[]
  name: string
  options: Options[]
}
export type RangeFilter = {
  filterFn: (
    subjects: Subject[],
    range: [min: number, max: number],
  ) => Subject[]
  max: number
  min: number
  name: string
  range: [min: number, max: number]
}

export const useFiltersStore = defineStore('filters', () => {
  const search = ref<string>('')
  const optionsFilters = ref<OptionsFilter[]>([
    {
      filterFn: (subjects, options) =>
        subjects.filter((s) => {
          if (
            !!(
              s.offeredCourse.appointments.type === 'weekly' &&
              options[0].selected
            ) ||
            (s.offeredCourse.appointments.type === 'block' &&
              options[1].selected)
          ) {
            return true
          }
          return false
        }),
      name: 'Veranstaltungsart',
      options: [
        { option: 'wöchentlich', selected: false },
        { option: 'Blockveranstaltung', selected: false },
      ],
    },
    {
      filterFn: (subjects, options) =>
        subjects.filter((s) => {
          if (s.offeredCourse.appointments.type === 'weekly') {
            return s.offeredCourse.appointments.dates.some(
              (d) => options[d.from.getDay()].selected,
            )
          }
          if (
            ['block', 'irregular'].includes(s.offeredCourse.appointments.type)
          ) {
            return s.offeredCourse.appointments.dates.some((m) => {
              // getDay() => 0 = Sunday
              const start = m.from.getDay() - 1
              const end = m.to.getDay() - 1
              for (let i = start; i <= end; i++) {
                if (options[i].selected) {
                  return true
                }
              }
              return false
            })
          }
          return false
        }),
      name: 'Wochentag',
      // TODO: use i18n (index instead of names)
      options: [
        { option: 'Montag', selected: false },
        { option: 'Dienstag', selected: false },
        { option: 'Mittwoch', selected: false },
        { option: 'Donnerstag', selected: false },
        { option: 'Freitag', selected: false },
        { option: 'Samstag', selected: false },
        { option: 'Sonntag', selected: false },
      ],
    },
  ])

  const rangeFilters = ref<RangeFilter[]>([
    {
      filterFn: (subjects, range) =>
        subjects.filter(
          (s) => s.semesterHours >= range[0] && s.semesterHours <= range[1],
        ),
      max: 20,
      min: 0,
      name: 'SWS',
      range: [0, 20],
    },
    {
      filterFn: (subjects, range) =>
        subjects.filter(
          (s) => s.creditPoints >= range[0] && s.creditPoints <= range[1],
        ),
      max: 20,
      min: 0,
      name: 'CP',
      range: [0, 20],
    },
    {
      filterFn: (subjects, range) =>
        subjects.filter(
          (s) =>
            (s.offeredCourse.minParticipants ?? 0) >= range[0] &&
            (s.offeredCourse.maxParticipants ?? 100) <= range[1],
        ),
      max: 100,
      min: 0,
      name: 'Teilnehmer',
      range: [0, 100],
    },
  ])

  const activeRangeFilters = computed(() =>
    rangeFilters.value.filter(
      (f) => f.min !== f.range[0] || f.max !== f.range[1],
    ),
  )

  const activeOptionsFilters = computed(() =>
    optionsFilters.value.filter((f) => f.options.some((o) => o.selected)),
  )

  const activeOptions = computed(() => {
    const activeOptions: Options[] = []
    activeOptionsFilters.value.forEach((oF) => {
      activeOptions.push(...oF.options.filter((o) => o.selected))
    })
    return activeOptions
  })

  function applyFilters(subjects: Subject[]): Subject[] {
    activeRangeFilters.value.forEach((filter) => {
      subjects = filter.filterFn(subjects, filter.range)
    })
    activeOptionsFilters.value.forEach((filter) => {
      subjects = filter.filterFn(subjects, filter.options)
    })

    return subjects
  }

  function searchSubjects(subjects: Subject[]): Subject[] {
    const searchString = search.value.trim().toLowerCase()
    if (!search.value.trim()) {
      return subjects
    }
    return subjects.filter(
      (s) =>
        //todo current locale or fallback
        !!s.title.de?.toLowerCase().includes(searchString) ||
        s.allLecturers.some((e) => e.toLowerCase().includes(searchString)) ||
        !!s.description.de?.toLowerCase().includes(searchString),
    )
  }

  function resetRange(f: RangeFilter) {
    if (f.min !== null && f.max !== null) {
      f.range[0] = f.min
      f.range[1] = f.max
    }
    return f
  }

  function resetFilters() {
    rangeFilters.value.forEach((f) => resetRange(f))
    optionsFilters.value.forEach((f) => {
      f.options.forEach((o) => {
        o.selected = false
      })
    })
  }

  function resetFilter(name: string) {
    rangeFilters.value.forEach((f) => {
      if (f.name === name) {
        f = resetRange(f)
      }
    })
    optionsFilters.value.forEach((f) => {
      f.options.forEach((o) => {
        if (o.option === name) {
          o.selected = false
        }
      })
    })
  }

  function resetSearch() {
    search.value = ''
  }

  return {
    activeOptions,
    activeOptionsFilters,
    activeRangeFilters,
    applyFilters,
    optionsFilters,
    rangeFilters,
    resetFilter,
    resetFilters,
    resetSearch,
    search,
    searchSubjects,
  }
})
