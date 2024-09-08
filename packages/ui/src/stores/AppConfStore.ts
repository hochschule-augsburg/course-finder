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
        await read()
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

  async function read() {
    conf.value = await trpc.appConf.read.query()
  }
})
