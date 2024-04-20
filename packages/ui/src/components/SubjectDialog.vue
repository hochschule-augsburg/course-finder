<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

defineProps<{
  subject?: Subject
}>()
const showSubjectDialog = defineModel<boolean>()
</script>

<template>
  <VDialog v-model:model-value="showSubjectDialog" max-width="750">
    <VCard v-if="subject" class="pa-2">
      <VCardTitle>
        <strong>{{ subject.title.de }}</strong>
        -
        {{
          subject.Lecturers.map((e) => e.name).join(', ') +
          (subject.externLecturers.length
            ? ' Extern: ' + subject.externLecturers.join(', ')
            : '')
        }}
      </VCardTitle>
      <VCardText class="pa-0 pb-3 px-3">
        <SubjectDetails :subject="subject" />
      </VCardText>
      <VCardActions class="mx-4">
        <VBtn
          href="https://cloud.hs-augsburg.de/s/e6bYJTCP4JQ5RXj"
          text="Modulhandbuch"
        />
        <VSpacer />
        <VBtn
          color="primary"
          text="Close"
          variant="tonal"
          @click="showSubjectDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
