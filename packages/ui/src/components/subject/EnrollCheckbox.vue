<script lang="ts" setup>
import { type Subject, useCoursesStore } from '@/stores/CoursesStore'
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
const coursesStore = useCoursesStore()

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
  <div class="cf-enroll-checkbox">
    <div v-if="!userStore.user?.Student" />
    <VTooltip v-else-if="!userStore.mayEnroll" location="top">
      <template #activator="{ props: toolTipProps }">
        <VIcon :icon="mdiLockAlert" size="large" v-bind="toolTipProps" />
      </template>
      {{ t('only-term-3-plus') }}
    </VTooltip>
    <template v-else-if="!subject.offeredCourse?.externalRegistration">
      <div
        v-if="coursesStore.currentPhase?.state === 'OPEN'"
        v-ripple
        class="pa-2 enroll-checkbox"
        @click.stop="handleUpdateEnroll"
      >
        <VBadge v-if="enrolled" :content="enrolled.points">
          <VIcon :icon="mdiCheckboxMarked" size="large" />
        </VBadge>
        <VIcon v-else :icon="mdiCheckboxBlankOutline" size="large" />
      </div>
      <div v-else class="pa-2 enroll-checkbox disabled" click.stop>
        <VTooltip location="top">
          <template #activator="{ props: toolTipProps }">
            <div v-bind="toolTipProps">
              <VBadge v-if="enrolled" :content="enrolled.points">
                <VIcon :icon="mdiCheckboxMarked" size="large" />
              </VBadge>
              <VIcon v-else :icon="mdiCheckboxBlankOutline" size="large" />
              <VIcon :icon="mdiLockAlert" class="lock" />
            </div>
          </template>
          {{ t('no-regs-accepted') }}
        </VTooltip>
      </div>
    </template>
    <VTooltip v-else location="top">
      <template #activator="{ props: toolTipProps }">
        <VIcon :icon="mdiAlphaEBox" size="large" v-bind="toolTipProps" />
      </template>
      {{ t('external-registration') }}
    </VTooltip>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss" scoped>
.enroll-checkbox.disabled {
  position: relative;
  cursor: not-allowed;

  .lock {
    position: absolute;
    bottom: 6px;
    font-size: 17px;
    right: -5px;
  }

  .v-icon:hover {
    color: initial;
  }
}
</style>

<i18n lang="yaml">
en:
  points-get-lost: The assigned points will be lost!
  external-registration: External Registration
  only-term-3-plus: Only from 3rd semester
  no-regs-accepted: No registrations accepted
de:
  points-get-lost: Die vergebenen Punkte gehen verloren!
  external-registration: Externe Anmeldung
  only-term-3-plus: Nur ab 3. Semester
  no-regs-accepted: Keine Anmeldungen akzeptiert
</i18n>
