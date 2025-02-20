<script lang="ts" setup>
import { type Subject, useCoursesStore } from '@/stores/CoursesStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VCard, VCardText } from 'vuetify/components'

import EnrollCheckbox from './EnrollCheckbox.vue'

const props = defineProps<{ subject: Subject }>()

const { locale, t } = useI18n()

const coursesStore = useCoursesStore()

const lecturers = computed(() => {
  if (props.subject.lecturers.length < 2) {
    return props.subject.lecturers[0]
  }
  return `${props.subject.lecturers[0]} ${t('et-a')}`
})

const dev = import.meta.env.DEV
</script>

<template>
  <VCard
    :subtitle="lecturers"
    :title="subject.title[locale]"
    class="subject-element"
    color="secondary"
    height="200"
    width="300"
    hover
  >
    <template v-if="coursesStore.currentPhase?.state === 'OPEN'" #append>
      <EnrollCheckbox :subject="subject" />
    </template>
    <VCardText>
      <span v-if="dev" class="font-italic font-weight-thin">{{
        subject.moduleCode
      }}</span>
      <div class="align-bot-right">
        <p>
          <strong>{{ subject.creditPoints }} {{ t('credit-points') }}</strong>
        </p>
        <p>
          <strong>{{ subject.semesterHours }} {{ t('semester-hours') }}</strong>
        </p>
        <template v-if="subject.offeredCourse">
          <p v-if="subject.offeredCourse.appointments.type === 'weekly'">
            <template
              v-for="(date, i) in subject.offeredCourse.appointments.dates"
              :key="i"
            >
              {{
                date.from.toLocaleDateString(locale, {
                  weekday: 'long',
                  hour: 'numeric',
                  minute: '2-digit',
                }) +
                ' - ' +
                date.to.toLocaleTimeString(locale, {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              }}<br />
            </template>
          </p>
          <p v-else-if="subject.offeredCourse.appointments.type === 'block'">
            {{ t('block-course') }}
          </p>
          <p v-else>{{ t('irregular') }}</p>
        </template>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
::v-deep(.v-card-title) {
  white-space: wrap;
  line-height: 1.3;
  padding-bottom: var(--element-spacing-xs);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
.align-bot-right {
  position: absolute;
  right: var(--element-spacing-m);
  bottom: var(--element-spacing-m);
  text-align: end;
}
</style>

<i18n lang="yaml">
en:
  semester-hours: SWS
  credit-points: CP
  block-course: Block Course
  irregular: Irregular
  external-registration: External Registration
  et-a: et al.

de:
  semester-hours: SWS
  credit-points: CP
  block-course: Blockveranstaltung
  irregular: Irregulär
  external-registration: Externe Anmeldung
  et-a: u. a.
</i18n>
