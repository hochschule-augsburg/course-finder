<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { mdiAlphaEBox } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import {
  VCard,
  VCardText,
  VCol,
  VIcon,
  VRow,
  VTooltip,
} from 'vuetify/components'

import EnrollCheckbox from './EnrollCheckbox.vue'

defineProps<{ subject: Subject }>()

const { locale, t } = useI18n()

const dev = import.meta.env.DEV
</script>

<template>
  <VCard
    :subtitle="subject.lecturers.join(', ')"
    :title="locale === 'de' ? subject.title.de : subject.title.en"
    color="secondary"
    height="200"
    width="300"
    hover
  >
    <template v-if="subject.offeredCourse" #append>
      <EnrollCheckbox
        v-if="!subject.offeredCourse.externalRegistration"
        :subject="subject"
      />
      <VTooltip v-else location="top">
        <template #activator="{ props }">
          <VIcon :icon="mdiAlphaEBox" size="large" v-bind="props" />
        </template>
        {{ t('external-registration') }}
      </VTooltip>
    </template>
    <VCardText>
      <span v-if="dev" class="font-italic font-weight-thin">{{
        subject.moduleCode
      }}</span>
      <VRow align="end" justify="end" style="height: 7rem">
        <VCol cols="auto" style="text-align: end">
          <p>
            <strong>{{ subject.creditPoints }} {{ t('credit-points') }}</strong>
          </p>
          <p>
            <strong
              >{{ subject.semesterHours }} {{ t('semester-hours') }}</strong
            >
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
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<i18n lang="yaml">
en:
  semester-hours: SWS
  credit-points: CP
  block-course: Block Course
  irregular: Irregular
  external-registration: External Registration

de:
  semester-hours: SWS
  credit-points: CP
  block-course: Blockveranstaltung
  irregular: Irregulär
  external-registration: Externe Anmeldung
</i18n>
