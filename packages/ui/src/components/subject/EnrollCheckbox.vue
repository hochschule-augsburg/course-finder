<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useCourseEnroll } from '@/stores/EnrollmentStore'
import { useI18n } from 'vue-i18n'
import { VBadge, VIcon } from 'vuetify/components'

import { dialogService } from '../DialogService'

const props = defineProps<{ subject: Subject }>()

const { t } = useI18n()

const { modelValue: enrolled, update: updateEnrolled } = useCourseEnroll(
  props.subject,
)

async function handleUpdateEnroll() {
  if (enrolled.value?.points) {
    const result = await new Promise((resolve) =>
      dialogService.showDialog({
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
        text: t('points-get-lost'),
        title: t('global.confirm-action'),
      }),
    )
    if (!result) {
      return
    }
  }
  updateEnrolled(!enrolled.value)
}
</script>

<template>
  <div v-ripple class="pa-2" @click.stop="handleUpdateEnroll">
    <VBadge v-if="enrolled" :content="enrolled.points">
      <VIcon icon="mdi-checkbox-marked" size="large" />
    </VBadge>
    <VIcon v-else icon="mdi-checkbox-blank-outline" size="large" />
  </div>
</template>

<i18n lang="yaml">
de:
  points-get-lost: Die vergebenen Punkte gehen verloren!
en:
  points-get-lost: The assigned points will be lost!
</i18n>
