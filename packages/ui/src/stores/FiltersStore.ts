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
        subjects.filter((e) => {
          if (!e.offeredCourse) {
            return true
          }
          if (
            (e.offeredCourse.appointments.type === 'weekly' &&
              options[0].selected) ||
            (e.offeredCourse.appointments.type === 'block' &&
              options[1].selected) ||
            (e.offeredCourse.appointments.type === 'irregular' &&
              options[2].selected)
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
        { option: 'filter.irregular', selected: false }, // Updated to use i18n key
      ],
    },
    {
      filterFn: (subjects, options) =>
        subjects.filter((subject) => {
          if (!subject.offeredCourse) {
            return true
          }
          if (subject.offeredCourse.appointments.type === 'weekly') {
            return subject.offeredCourse.appointments.dates.some((date) => {
              return options[date.from.getDay()].selected
            })
          }
          if (
            ['block', 'irregular'].includes(
              subject.offeredCourse.appointments.type,
            )
          ) {
            return subject.offeredCourse.appointments.dates.some((meeting) => {
              // getDay() => 0 = Sunday
              const start = meeting.from.getDay()
              const end = meeting.to.getDay()
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
        { option: 'filter.sunday', selected: false },
        { option: 'filter.monday', selected: false },
        { option: 'filter.tuesday', selected: false },
        { option: 'filter.wednesday', selected: false },
        { option: 'filter.thursday', selected: false },
        { option: 'filter.friday', selected: false },
        { option: 'filter.saturday', selected: false },
      ],
    },
  ])

  const rangeFilters: RangeFilter[] = reactive([
    {
      filterFn: (subjects: Subject[], range: [min: number, max: number]) =>
        subjects.filter(
          (subject) =>
            subject.semesterHours >= range[0] &&
            subject.semesterHours <= range[1],
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
          (subject) =>
            (subject.offeredCourse?.minParticipants ?? 0) >= range[0] &&
            (subject.offeredCourse?.maxParticipants ?? 100) <= range[1],
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
    activeOptionsFilters.value.forEach((filter) => {
      activeOptions.push(...filter.options.filter((o) => o.selected))
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
      (subject) =>
        !!subject.title.de?.toLowerCase().includes(searchString) ||
        !!subject.title.en?.toLowerCase().includes(searchString) ||
        subject.lecturers.some((e) => e.toLowerCase().includes(searchString)),
    )
  }

  function resetRange(filter: RangeFilter) {
    if (filter.min !== null && filter.max !== null) {
      filter.range[0] = filter.min
      filter.range[1] = filter.max
    }
    return filter
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
    rangeFilters.forEach((filter) => {
      if (filter.name === name) {
        filter = resetRange(filter)
      }
    })
    optionsFilters.forEach((filter) => {
      filter.options.forEach((option) => {
        if (option.option === name) {
          option.selected = false
        }
      })
    })
  }

  function resetSearch() {
    search.value = ''
  }
})
