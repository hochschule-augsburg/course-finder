import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { UserExtended } from '../../../api/src/libExports'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserExtended>()
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
  }
  async function init() {
    user.value = await trpc.auth.getUser.query()
  }
})
