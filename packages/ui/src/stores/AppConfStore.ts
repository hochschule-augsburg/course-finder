import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { trpc } from '@/trpc'

import { useUserStore } from './UserStore'

export const useAppConfStore = defineStore('app-conf', () => {
  const userStore = useUserStore()
  const conf = ref<AppConf | null>(null)

  watch(
    () => userStore.user,
    async () => {
      try {
        if (userStore.user) {
          await fetch()
        }
      } catch {
        // do nothing
      }
    },
    { immediate: true },
  )

  return {
    conf,
    update,
  }

  async function update(input: Partial<AppConf>) {
    await trpc.appConf.update.mutate(input)
    conf.value = Object.assign({}, conf.value, input)
  }

  async function fetch() {
    conf.value = await trpc.appConf.read.query()
  }
})
