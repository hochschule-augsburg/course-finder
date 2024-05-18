import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'

import type { Subject } from './CoursesStore'

import { useUserStore } from './UserStore'

export type Options = {
  option: string
  selected: boolean
}

export type OptionsFilter = {
  filterFn: (subjects: Subject[], options: Options[]) => Subject[]
  hidden?: boolean
  name: string
  options: Options[]
}
export type RangeFilter = {
  filterFn: (
    subjects: Subject[],
    range: [min: number, max: number],
  ) => Subject[]
  hidden?: boolean
  max: number
  min: number
  name: string
  range: [min: number, max: number]
}

export const useFiltersStore = defineStore('filters', () => {
  const userStore = useUserStore()
  const search = ref<string>('')
  const hideNonStudentFilters = computed(
    () => userStore.user?.type !== 'Student',
  )
  const optionsFilters: OptionsFilter[] = reactive([
    {
      filterFn: (subjects: Subject[], options: Options[]) =>
        subjects.filter((s) => {
          if (!s.offeredCourse) {
            return true
          }
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
      hidden: hideNonStudentFilters,
      name: 'filter.type-of-event',
      options: [
        { option: 'filter.weekly', selected: false }, // Updated to use i18n key
        { option: 'filter.block-event', selected: false }, // Updated to use i18n key
      ],
    },
    {
      filterFn: (subjects, options) =>
        subjects.filter((s) => {
          if (!s.offeredCourse) {
            return true
          }
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
      hidden: hideNonStudentFilters,
      name: 'filter.weekday',
      options: [
        { option: 'filter.monday', selected: false },
        { option: 'filter.tuesday', selected: false },
        { option: 'filter.wednesday', selected: false },
        { option: 'filter.thursday', selected: false },
        { option: 'filter.friday', selected: false },
        { option: 'filter.saturday', selected: false },
        { option: 'filter.sunday', selected: false },
      ],
    },
  ])

  const rangeFilters: RangeFilter[] = reactive([
    {
      filterFn: (subjects: Subject[], range: [min: number, max: number]) =>
        subjects.filter(
          (s) => s.semesterHours >= range[0] && s.semesterHours <= range[1],
        ),
      max: 20,
      min: 0,
      name: 'filter.semester-hours',
      range: [0, 20],
    },
    {
      filterFn: (subjects: Subject[], range: [min: number, max: number]) =>
        subjects.filter(
          (s) => s.creditPoints >= range[0] && s.creditPoints <= range[1],
        ),
      max: 20,
      min: 0,
      name: 'filter.credit-points',
      range: [0, 20],
    },
    {
      filterFn: (subjects: Subject[], range: [min: number, max: number]) =>
        subjects.filter(
          (s) =>
            (s.offeredCourse?.minParticipants ?? 0) >= range[0] &&
            (s.offeredCourse?.maxParticipants ?? 100) <= range[1],
        ),
      hidden: hideNonStudentFilters,
      max: 100,
      min: 0,
      name: 'filter.participants',
      range: [0, 100],
    },
  ])

  const activeRangeFilters = computed(() =>
    rangeFilters.filter((f) => f.min !== f.range[0] || f.max !== f.range[1]),
  )

  const activeOptionsFilters = computed(() =>
    optionsFilters.filter((f) => f.options.some((o) => o.selected)),
  )

  const activeOptions = computed(() => {
    const activeOptions: Options[] = []
    activeOptionsFilters.value.forEach((oF) => {
      activeOptions.push(...oF.options.filter((o) => o.selected))
    })
    return activeOptions
  })

  watch(() => userStore.user, resetFilters)

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
        !!s.title.de?.toLowerCase().includes(searchString) ||
        !!s.title.en?.toLowerCase().includes(searchString) ||
        s.lecturers.some((e) => e.toLowerCase().includes(searchString)),
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
    rangeFilters.forEach((f) => resetRange(f))
    optionsFilters.forEach((f) => {
      f.options.forEach((o) => {
        o.selected = false
      })
    })
  }

  function resetFilter(name: string) {
    rangeFilters.forEach((f) => {
      if (f.name === name) {
        f = resetRange(f)
      }
    })
    optionsFilters.forEach((f) => {
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
})
