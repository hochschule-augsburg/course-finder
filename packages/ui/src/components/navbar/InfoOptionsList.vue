<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { VDivider, VList, VListItem } from 'vuetify/components'

const { t } = useI18n()

const startOnboarding = inject<() => void>('startOnboarding')
</script>

<template>
  <VList>
    <VListItem :title="t('tutorial')" @click="startOnboarding" />
    <VDivider />
    <VListItem
      :title="t('documentation')"
      href="https://sirchnik.github.io/subject-enroll/"
      target="_blank"
    />
  </VList>
</template>

<i18n lang="yaml">
en:
  tutorial: Tutorial
  documentation: Documentation
de:
  tutorial: Tutorial
  documentation: Dokumentation
</i18n>
