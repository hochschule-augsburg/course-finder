<script lang="ts" setup>
import { mdiUpload } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="mx-15">
    <div class="d-flex justify-space-between">
      <h1>{{ t('courses') }}</h1>
      <VBtn color="primary" to="courses/upload">
        {{ t('add') }}
        <template #append>
          <VIcon :icon="mdiUpload" color="white" size="20" />
        </template>
      </VBtn>
    </div>
    <AdminSubjectList />
  </div>
</template>

<i18n lang="yaml">
en:
  courses: All courses
  add: Import courses
de:
  courses: Alle Kurse
  add: Kurse importieren
</i18n>
