<script lang="ts" setup>
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
        <VCol cols="8" />
        <VCol>
          <VBtn class="mr-8" color="primary" to="courses/upload">
            {{ t('add') }}
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
  add: Add
de:
  courses: Alle Kurse
  add: Hinzufügen
</i18n>
