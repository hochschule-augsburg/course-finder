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
  const pathArray = route.path.split('/').slice(1, -1)
  const breadcrumbItems = pathArray.map((path, index) => {
    const fullPath = '/' + pathArray.slice(0, index + 1).join('/')
    const routeMatch = router.resolve(fullPath)

    return {
      disabled: false,
      href: fullPath,
      noBreadcrumbs: routeMatch.meta.noBreadcrumbs,
      params: routeMatch.params,
      text: routeMatch.name?.toString(),
    }
  })

  breadcrumbItems.push({
    disabled: true,
    href: route.fullPath,
    noBreadcrumbs: route.meta.noBreadcrumbs,
    params: route.params,
    text: route.name?.toString(),
  })

  return breadcrumbItems
    .filter((item) => !item.noBreadcrumbs)
    .map((item) => ({
      ...item,
      text: item.text
        ?.replace(/\/$/, '.index')
        .replace(/\[|\]/g, '')
        .replace(/\//g, '.'),
    }))
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
          t(`pages${item.text}`, item.params)
        }}
      </VBreadcrumbsItem>
    </template>
  </VBreadcrumbs>
</template>
