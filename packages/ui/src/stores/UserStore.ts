import type { UserExtended } from '@api/prisma/PrismaTypes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useEnrollmentStore } from './enrollment'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserExtended>()
  const enrollmentStore = useEnrollmentStore()
  void init()
  return { login, logout, user }

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
    await enrollmentStore.init()
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
    await enrollmentStore.init()
    return result
  }

  async function logout() {
    await trpc.auth.logout.mutate()
    user.value = undefined
  }

  async function init() {
    // dev auto login
    if (import.meta.env.DEV) {
      await login(
        import.meta.env.VITE_INITIAL_USER,
        import.meta.env.VITE_INITIAL_PWD,
      )
    }
    user.value = await trpc.auth.getUser.query()
  }
})
