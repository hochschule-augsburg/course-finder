import { maxBy, minBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { fieldsOfStudy } from '@/helper/enums/fieldsOfStudy'

import { useAppConfStore } from './AppConfStore'
import { type Subject, useCoursesStore } from './CoursesStore'
import { useUserStore } from './UserStore'

export type Option = {
  option: string
  selected: boolean
}

export type OptionsFilter = {
  exclusive?: boolean
  filterFn: (subjects: Subject[], options: Option[]) => Subject[]
  hidden?: boolean
  name: string
  options: Option[]
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
  const { locale } = useI18n()
  const userStore = useUserStore()
  const coursesStore = useCoursesStore()
  const appConfStore = useAppConfStore()

  const search = ref<string>('')
  const hideNoPhaseFilters = computed(() => !coursesStore.currentPhase)
  const hideMinFocusFilter = computed(
    () =>
      userStore.user?.Student?.fieldOfStudy !== 'Informatik (Master)' ||
      appConfStore.conf?.hasMinFocuses === false,
  )
  const optionsFilters: OptionsFilter[] = reactive([
    {
      filterFn: (subjects: Subject[], options: Option[]) =>
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
      hidden: hideNoPhaseFilters,
      name: 'filter.type-of-event',
      options: [
        { option: 'filter.weekly', selected: false },
        { option: 'filter.block-event', selected: false },
        { option: 'filter.irregular', selected: false },
      ],
    },
    {
      filterFn: (subjects: Subject[], options: Option[]) => {
        const miscSelected = options.at(-1)?.selected

        const selectedOptions = options
          .filter((option) => option.selected)
          .map((option) => option.option)

        return subjects.filter((subject) => {
          if (selectedOptions.length === 0) {
            return true
          }
          if (miscSelected && !subject.examTypes.length) {
            return true
          }
          if (subject.examTypes.length === 0) {
            return false
          }
          return subject.examTypes.every((type) =>
            selectedOptions.includes(type),
          )
        })
      },

      name: computed(() =>
        userStore.user?.Student ? 'filter.exam-type-stud' : 'filter.exam-type',
      ),
      options: [
        {
          option: 'filter.ex.written-exam',
          selected: false,
        },
        {
          option: 'filter.ex.project-work',
          selected: false,
        },
        {
          option: 'filter.ex.written-assignment',
          selected: false,
        },
        {
          option: 'filter.ex.presentation',
          selected: false,
        },
        {
          option: 'filter.ex.e-written',
          selected: false,
        },
        {
          option: 'filter.ex.oral',
          selected: false,
        },
        {
          option: 'filter.ex.misc',
          selected: false,
        },
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
      hidden: hideNoPhaseFilters,
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
    {
      filterFn: (subjects, options) => {
        const selectedOption = options.find((e) => e.selected)?.option
        if (!selectedOption) {
          return subjects
        }
        return subjects.filter((e) =>
          e.offeredCourse?.for.includes(selectedOption),
        )
      },
      hidden: hideNoPhaseFilters,
      name: 'filter.field-of-study',
      options: Object.keys(fieldsOfStudy).map((fieldOfStudy) => ({
        option: `${fieldOfStudy}`,
        selected: false,
      })),
    },
    {
      filterFn: (subjects, options) => {
        const selectedOptions = options
          .filter((e) => e.selected)
          .map((e) => e.option)
        return subjects.filter((subject) => {
          if (!subject.minFocus) {
            return false
          }

          const options = Object.entries(subject.minFocus).flatMap(
            ([key, value]: [string, string[]]) => {
              return value.map((v) => `${key}#${v}`)
            },
          )
          return options.some((e) => selectedOptions.includes(e))
        })
      },
      hidden: hideMinFocusFilter,
      name: 'filter.min-focus',
      options: [
        { option: 'Medieninformatik#A', selected: false },
        { option: 'SW-Engineering#A', selected: false },
        { option: 'SW-Engineering#B', selected: false },
        { option: 'IT-Sicherheit#A', selected: false },
        { option: 'Technische Informatik#A', selected: false },
        { option: 'Technische Informatik#B', selected: false },
        { option: 'Technische Informatik#C', selected: false },
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
      hidden: hideNoPhaseFilters,
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
    const activeOptions: Option[] = []
    activeOptionsFilters.value.forEach((filter) => {
      activeOptions.push(...filter.options.filter((o) => o.selected))
    })
    return activeOptions
  })

  watch(() => userStore.user, resetFilters)
  watch(() => coursesStore.subjects, updateFilters)

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
    if (!searchString) {
      return subjects
    }
    return subjects.filter((subject) => {
      const initials = subject.title[locale.value]
        ?.toLowerCase()
        .split(' ')
        .flatMap((e) => e.split('-'))
        .map((e) => e[0])
        .join('')
      return (
        initials?.includes(searchString) ||
        !!subject.title[locale.value]?.toLowerCase().includes(searchString) ||
        subject.lecturers.some((e) => e.toLowerCase().includes(searchString))
      )
    })
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

  function updateFilterRange(
    filterName: string,
    subjects: Subject[],
    property: 'creditPoints' | 'semesterHours',
  ) {
    const filter = rangeFilters.find((f) => f.name === filterName)
    if (filter) {
      filter.range[0] = minBy(subjects, property)?.[property] ?? 0
      filter.range[1] = maxBy(subjects, property)?.[property] ?? 0
      filter.min = filter.range[0]
      filter.max = filter.range[1]
    }
  }

  function updateFilters() {
    if (coursesStore.subjects) {
      const tlnmFilter = rangeFilters.find((f) => f.name === 'Teilnehmer')
      if (tlnmFilter) {
        tlnmFilter.range[0] =
          maxBy(coursesStore.subjects, 'offeredCourse.minParticipants')
            ?.offeredCourse?.minParticipants ?? 0
        tlnmFilter.range[1] =
          maxBy(coursesStore.subjects, 'offeredCourse.maxParticipants')
            ?.offeredCourse?.maxParticipants ?? 0
        tlnmFilter.min = tlnmFilter.range[0]
        tlnmFilter.max = tlnmFilter.range[1]
      }
      updateFilterRange('CP', coursesStore.subjects, 'creditPoints')
      updateFilterRange('SWS', coursesStore.subjects, 'semesterHours')
    }
  }
})
