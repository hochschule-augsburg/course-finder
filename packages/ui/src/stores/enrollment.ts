import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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
  sws: number
  weekly: Meeting | undefined
}

export type SubjectProp = keyof Subject

export const useEnrollmentStore = defineStore('enrollment', () => {
  const count = ref(0)
  const name = ref('Eduardo')
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment, name }
})
