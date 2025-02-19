<script lang="ts" setup>
import { mdiUpload } from '@mdi/js'
</script>

<template>
  <div class="mx-15">
    <div class="d-flex justify-space-between">
      <h1>Alle Kurse</h1>
      <VBtn color="primary" to="courses/upload">
        Kurse importieren
        <template #append>
          <VIcon :icon="mdiUpload" color="white" size="20" />
        </template>
      </VBtn>
    </div>
    <AdminSubjectList />
  </div>
</template>
