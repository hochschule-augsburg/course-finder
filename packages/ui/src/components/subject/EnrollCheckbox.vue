<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useCourseEnroll } from '@/stores/EnrollmentStore'
import { VIcon } from 'vuetify/components'

import { dialogService } from '../DialogService'

export type abc = 123

const props = defineProps<{ subject: Subject }>()

const { modelValue: enrolled, update: updateEnrolled } = useCourseEnroll(
  props.subject,
)

async function handleUpdateEnroll() {
  if (enrolled.value?.points) {
    const result = await new Promise((resolve) =>
      dialogService.showDialog({
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
        text: 'points-get-lost',
        title: 'confirm-action',
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
  <div
    v-ripple
    class="enroll-checkbox pa-2"
    @click="handleUpdateEnroll"
    @click.stop
  >
    <VIcon
      v-if="enrolled?.points"
      color="green-darken-2"
      icon="mdi-pencil-box-multiple"
      size="large"
    />
    <VIcon
      v-else-if="enrolled"
      color="green-darken-2"
      icon="mdi-pencil-box"
      size="large"
    />
    <VIcon
      v-else
      color="green-darken-2"
      icon="mdi-checkbox-blank-outline"
      size="large"
    />
  </div>
</template>
