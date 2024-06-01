<script setup lang="ts">
import type { StepEntity } from 'v-onboarding'

import { useTourPool } from '@/composables/tourPool'
import { mdiClose } from '@mdi/js'
import { VOnboardingStep, VOnboardingWrapper } from 'v-onboarding'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  name: symbol
  steps: StepEntity[]
}>()

const { t } = useI18n()
const onboardingWrapper = ref<null | typeof VOnboardingWrapper>(null)
const { registerTour } = useTourPool()
const { finish } = registerTour(onboardingWrapper, props.name)
</script>

<template>
  <VOnboardingWrapper :steps ref="onboardingWrapper">
    <template #default="{ previous, next, step, isFirst, isLast }">
      <VOnboardingStep>
        <VCard
          v-if="step.content"
          :text="step.content.description"
          :title="step.content.title"
          max-width="300"
        >
          <template #append>
            <VIcon :icon="mdiClose" @click="finish" />
          </template>

          <VCardActions>
            <VBtn
              v-if="!isFirst"
              :text="t('tour.prev')"
              variant="plain"
              @click="previous"
            />
            <VSpacer />
            <VBtn
              :text="isLast ? t('tour.finish') : t('tour.next')"
              color="primary"
              variant="tonal"
              @click="next"
            />
          </VCardActions>
        </VCard>
      </VOnboardingStep>
    </template>
  </VOnboardingWrapper>
</template>
