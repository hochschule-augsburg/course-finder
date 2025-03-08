import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/trpc'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useUserStore } from './UserStore'

export const useAppConfStore = defineStore('app-conf', () => {
  const userStore = useUserStore()
  const conf = ref<AppConf | null>(null)

  watch(
    () => userStore.user,
    async () => {
      try {
        await fetch()
      } catch {
        // do nothing
      }
    },
    { immediate: true },
  )
  console.log('app conf store created')

  return {
    conf,
    update,
  }

  async function update(input: Partial<AppConf>) {
    await trpc.appConf.update.mutate(input)
    conf.value = Object.assign({}, conf.value, input)
  }

  async function fetch() {
    console.log('fetching app conf')
    conf.value = await trpc.appConf.read.query()
  }
})
