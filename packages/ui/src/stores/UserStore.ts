import type { ClientUserExtended } from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router/auto'

export const useUserStore = defineStore('user', () => {
  const user = ref<ClientUserExtended>()
  const router = useRouter()
  const initPromise = init()
  return { initPromise, login, logout, user }

  async function login(username: string, password: string, otp?: string) {
    if (otp) {
      return twoFA(username, otp)
    }
    const result = await trpc.auth.login.mutate({
      password,
      username,
    })
    if (typeof result === 'object') {
      user.value = result
    }

    return result
  }

  async function twoFA(username: string, otp: string) {
    const result = await trpc.auth.twoFA.mutate({
      otp,
      username,
    })
    if (typeof result === 'object') {
      user.value = result
    }

    return result
  }

  async function logout() {
    await trpc.auth.logout.mutate()
    user.value = undefined
    await router.push('/')
  }

  async function init() {
    // dev auto login
    if (import.meta.env.VITE_INITIAL_USER && import.meta.env.VITE_INITIAL_PWD) {
      await login(
        import.meta.env.VITE_INITIAL_USER,
        import.meta.env.VITE_INITIAL_PWD,
      )
    }
    user.value = await trpc.auth.getUser.query()
  }
})
