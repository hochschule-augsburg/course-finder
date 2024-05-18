import { useUserStore } from '@/stores/UserStore'
import { createRouter, createWebHistory } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
})

router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    const userStore = useUserStore()
    await userStore.initPromise
    if (userStore.user?.type !== 'Admin') {
      return { path: '/' }
    }
  }
})

router.afterEach((to, from) => {
  // pushing a hash to the URL should not scroll to the top
  if (from.path === to.path) {
    return
  }
  document.documentElement.scrollTop = 0
})

export default router
