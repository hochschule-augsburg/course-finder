<script lang="ts" setup>
import { mdiChevronRight } from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { VBreadcrumbs, VBreadcrumbsItem, VIcon } from 'vuetify/components'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const routeItems = computed<any>(() => {
  if (route.path === '/') {
    return []
  }

  const breadcrumbItems: {
    disabled: boolean;
    href: string;
    noBreadcrumbs: boolean;
    params: Record<string, string>;
    text: string;
  }[] = [
    {
      disabled: false,
      href: '/',
      noBreadcrumbs: false,
      params: {},
      text: '.index',
    },
  ]

  for (const [i, match] of route.matched.slice(0, -1).entries()) {
    if (match.meta.noBreadcrumbs) {
      continue
    }
    const text = match.path.split('/').join('.')
    breadcrumbItems.push({
      disabled: i === route.matched.length - 2, // disable last
      href: match.path,
      noBreadcrumbs: match.meta.noBreadcrumbs,
      params: route.params,
      text: match.children.length ? `${text}.index` : text,
    })
  }

  return breadcrumbItems
})
</script>

<template>
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
