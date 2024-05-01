<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useCourseEnroll } from '@/stores/EnrollmentStore'
import { useI18n } from 'vue-i18n'
import { VCheckbox } from 'vuetify/components'

import { dialogService } from '../DialogService'

const props = defineProps<{ subject: Subject }>()

const { locale } = useI18n()

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
      // TODO checkbox ist blöd
      return
    }
  }
  updateEnrolled(!enrolled.value)
}
</script>

<template>
  <VCard
    :subtitle="subject.lecturers.join(', ')"
    :title="locale === 'de' ? subject.title.de : subject.title.en"
    class="hoverable-card"
    color="rgb(var(--v-theme-secondary))"
    height="200"
    width="300"
    hover
  >
    <template v-if="subject.offeredCourse" #append>
      <VCheckbox
        :model-value="!!enrolled"
        @click.stop
        @update:model-value="handleUpdateEnroll"
      />
    </template>
    <VCardText>
      <VRow align="end" justify="end" style="height: 7rem">
        <VCol cols="auto" style="text-align: end">
          <p>
            <strong>{{ subject.creditPoints }} CP</strong>
          </p>
          <p>
            <strong>{{ subject.semesterHours }} SWS</strong>
          </p>
          <template v-if="subject.offeredCourse">
            <p v-if="subject.offeredCourse.appointments.type === 'weekly'">
              <template
                v-for="(date, i) in subject.offeredCourse.appointments.dates"
                :key="i"
              >
                {{
                  date.from.toLocaleDateString([], {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: '2-digit',
                  }) +
                  ' - ' +
                  date.to.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                }}<br />
              </template>
            </p>
            <p v-else-if="subject.offeredCourse.appointments.type === 'block'">
              Blockveranstaltung
            </p>
            <p v-else>Irregulär</p>
          </template>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
