<script lang="ts" setup>
import { mdiUpload } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="mx-15">
    <VContainer>
      <VRow justify="center">
        <VCol>
          <h1>{{ t('courses') }}</h1>
        </VCol>
        <VCol class="text-right">
          <VBtn color="primary" to="courses/upload">
            {{ t('add') }}
            <template #append>
              <VIcon :icon="mdiUpload" color="white" size="20" />
            </template>
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>
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
