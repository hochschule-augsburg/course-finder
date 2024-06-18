<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useCourseEnroll } from '@/stores/EnrollmentStore'
import { useUserStore } from '@/stores/UserStore'
import {
  mdiAlphaEBox,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiLockAlert,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'
import { VBadge, VIcon, VTooltip } from 'vuetify/components'

import { dialogService } from '../DialogService'

const props = defineProps<{ subject: Subject }>()

const { t } = useI18n()

const { modelValue: enrolled, update: updateEnrolled } = useCourseEnroll(
  props.subject,
)
const userStore = useUserStore()

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
  <VTooltip v-if="(userStore.user?.Student?.term ?? 0) < 3" location="top">
    <template #activator="{ props: toolTipProps }">
      <VIcon :icon="mdiLockAlert" size="large" v-bind="toolTipProps" />
    </template>
    {{ t('only-term-3-plus') }}
  </VTooltip>
  <div
    v-else-if="!subject.offeredCourse?.externalRegistration"
    v-ripple
    class="pa-2"
    @click.stop="handleUpdateEnroll"
  >
    <VBadge v-if="enrolled" :content="enrolled.points">
      <VIcon :icon="mdiCheckboxMarked" size="large" />
    </VBadge>
    <VIcon v-else :icon="mdiCheckboxBlankOutline" size="large" />
  </div>
  <VTooltip v-else location="top">
    <template #activator="{ props: toolTipProps }">
      <VIcon :icon="mdiAlphaEBox" size="large" v-bind="toolTipProps" />
    </template>
    {{ t('external-registration') }}
  </VTooltip>
</template>

<i18n lang="yaml">
en:
  points-get-lost: The assigned points will be lost!
  external-registration: External Registration
  only-term-3-plus: Only from 3rd semester
de:
  points-get-lost: Die vergebenen Punkte gehen verloren!
  external-registration: Externe Anmeldung
  only-term-3-plus: Nur ab 3. Semester
</i18n>
