<script lang="ts" setup>
import { type Subject, useCoursesStore } from '@/stores/CoursesStore'
import { useI18n } from 'vue-i18n'
import {
  VCol,
  VContainer,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VRow,
} from 'vuetify/components'

import EnrollCheckbox from './EnrollCheckbox.vue'
defineProps<{ subject: Subject }>()

const { locale, t } = useI18n()

const coursesStore = useCoursesStore()
</script>

<template>
  <div>
    <VExpansionPanelTitle color="secondary">
      <EnrollCheckbox
        v-if="coursesStore.currentPhase?.state === 'OPEN'"
        :subject
        class="checkbox"
      />
      <VContainer class="ma-0 ml-2">
        <VRow no-gutters>
          <VCol cols="5">
            <strong class="v-card-title pl-0">
              {{ locale === 'de' ? subject.title.de : subject.title.en }}
            </strong>
          </VCol>
          <VCol cols="3">
            {{ subject.semesterHours }} {{ t('semester-hours') }}
          </VCol>
          <template v-if="subject.offeredCourse">
            <VCol
              v-if="subject.offeredCourse.appointments.type === 'weekly'"
              cols="4"
            >
              <template
                v-for="(date, i) in subject.offeredCourse.appointments.dates"
                :key="i"
              >
                <span>
                  {{
                    date.from.toLocaleDateString(locale, {
                      weekday: 'long',
                    })
                  }}
                  <br />
                </span>
              </template>
            </VCol>
            <VCol
              v-else-if="subject.offeredCourse.appointments.type === 'block'"
            >
              {{ t('block-course') }}
            </VCol>
            <VCol v-else> {{ t('irregular') }} </VCol>
          </template>
        </VRow>
        <VRow no-gutters>
          <VCol class="v-card-subtitle" cols="5">
            {{ subject.lecturers.join(', ') }}
          </VCol>
          <VCol cols="3">
            {{ subject.creditPoints }} {{ t('credit-points') }}
          </VCol>
          <template v-if="subject.offeredCourse">
            <VCol
              v-if="subject.offeredCourse.appointments.type === 'weekly'"
              cols="4"
            >
              <template
                v-for="(date, i) in subject.offeredCourse.appointments.dates"
                :key="i"
              >
                <span>
                  {{
                    date.from.toLocaleTimeString(locale, {
                      hour: 'numeric',
                      minute: '2-digit',
                    }) +
                    ' - ' +
                    date.to.toLocaleTimeString(locale, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  }}
                  <br />
                </span>
              </template>
            </VCol>
          </template>
        </VRow>
      </VContainer>
    </VExpansionPanelTitle>
    <VExpansionPanelText class="pa-0 pb-3 px-3">
      <SubjectDetails :subject="subject" />
    </VExpansionPanelText>
  </div>
</template>

<style scoped lang="scss">
.checkbox {
  position: absolute;
  top: var(--element-spacing-s);
  left: var(--element-spacing-xs);
}
</style>

<i18n lang="yaml">
en:
  semester-hours: SWS
  credit-points: CP
  block-course: Block Course
  irregular: Irregular

de:
  semester-hours: SWS
  credit-points: CP
  block-course: Blockveranstaltung
  irregular: Irregulär
</i18n>
