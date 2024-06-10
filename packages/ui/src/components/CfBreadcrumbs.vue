<script lang="ts" setup>
import { mdiChevronRight } from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { VBreadcrumbs, VBreadcrumbsItem, VIcon } from 'vuetify/components'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const routeItems = computed(() => {
  if (route.path === '/') {
    return []
  }
  const pathArray = route.path.split('/')
  pathArray.shift()
  pathArray.pop()
  return [
    ...pathArray.map((path, index) => {
      const fullPath = '/' + pathArray.slice(0, index + 1).join('/')
      const routeMatch = router.resolve(fullPath)
      return {
        href: fullPath,
        params: routeMatch.params,
        text: routeMatch.name,
      }
    }),
    {
      disabled: true,
      href: route.fullPath,
      params: route.params,
      text: route.name?.toString(),
    },
  ].filter((item) => !item.text?.toString().includes('/'))
})
</script>

<template>
  <!-- @vue-expect-error -->
  <VBreadcrumbs :items="routeItems" class="ml-9">
    <template #divider>
      <VIcon :icon="mdiChevronRight" />
    </template>
    <template #item="{ item }">
      <VBreadcrumbsItem :disabled="item.disabled" :to="item.href">
        {{
          // @ts-expect-error wrong typing in vuetify
          t(`pages.${item.text}`, item.params)
        }}
      </VBreadcrumbsItem>
    </template>
  </VBreadcrumbs>
</template>
