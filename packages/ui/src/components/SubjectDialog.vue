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
        <strong>{{ subject.name }}</strong>
        -
        {{ subject.prof }}
      </VCardTitle>
      <VCardText>
        <VContainer class="pa-0 pb-3 px-3">
          <VRow align="center">
            <VCol class="pl-1" cols="2.5">
              <strong>{{ subject.sws }} SWS</strong>
            </VCol>
            <VCol class="pl-1" cols="2.5">
              <strong>{{ subject.cp }} CP</strong>
            </VCol>
            <VCol align="end" cols="7">
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
