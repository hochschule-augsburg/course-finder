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
      <VCardText>
        <VContainer class="pa-0 pb-3 px-3">
          <VRow align="center">
            <VCol class="pl-1" cols="2.5">
              <strong>{{ subject.semesterHours }} SWS</strong>
            </VCol>
            <VCol class="pl-1" cols="2.5">
              <strong>{{ subject.creditPoints }} CP</strong>
            </VCol>
            <VCol align="end" cols="7">
              <!-- @vue-ignore todo for later -->
              <VBtn :href="subject.moduleMan"> Modulhandbuch </VBtn>
            </VCol>
          </VRow>
          <SubjectDetails :subject="subject" />
        </VContainer>
      </VCardText>
      <VCardActions class="mx-4">
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
