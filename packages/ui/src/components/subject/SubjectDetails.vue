<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { trpc } from '@/trpc'
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiCalendar,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiLectern,
} from '@mdi/js'
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'
import { useTheme } from 'vuetify'
import {
  VBtn,
  VCarousel,
  VCarouselItem,
  VDialog,
  VIcon,
  VSheet,
} from 'vuetify/components'

const props = defineProps<{
  subject: Subject
}>()

const { locale, t } = useI18n()

const { state: pdfSource } = useAsyncState(
  async () =>
    (await trpc.course.getPdf.query({ moduleCode: props.subject.moduleCode }))
      .pdf,
  undefined,
)
const theme = useTheme()
const fullscreen = ref(false)
</script>

<template>
  <div>
    <VCarousel :show-arrows="false" height="68vh" hide-delimiter-background>
      <VCarouselItem>
        <VSheet
          class="px-4 py-6 overflow-y-auto"
          color="secondary"
          height="100%"
          rounded="lg"
        >
          <div class="mb-1 d-flex align-end">
            <VIcon :icon="mdiLectern" class="mr-3" size="32" />
            <h4>{{ t('lecturers') }}</h4>
          </div>
          <div>
            <p class="mb-4 px-3">
              {{ subject.lecturers.join(', ') }}
            </p>
          </div>
          <div class="mb-1 d-flex align-end">
            <VIcon :icon="mdiAccountMultiple" class="mr-3" size="32" />
            <h4>{{ t('workload') }}</h4>
          </div>
          <div class="mb-4 px-3 d-flex flex-column">
            <p>{{ subject.semesterHours }} {{ t('semester-hours') }}</p>
            <p>{{ subject.creditPoints }} {{ t('credit-points') }}</p>
          </div>
          <template v-if="subject.offeredCourse">
            <div class="mb-1 d-flex align-end">
              <VIcon :icon="mdiAccountMultiple" class="mr-3" size="32" />
              <h4>{{ t('participants') }}</h4>
            </div>
            <p class="mb-4 px-3">
              {{
                subject.offeredCourse.minParticipants +
                ' - ' +
                (subject.offeredCourse.maxParticipants
                  ? +subject.offeredCourse.maxParticipants
                  : '∞')
              }}
            </p>

            <div class="mb-1 d-flex align-end">
              <VIcon :icon="mdiCalendar" class="mr-3" size="32" />
              <h4>{{ t('appointments') }}</h4>
            </div>
            <p
              v-if="subject.offeredCourse.appointments.type === 'weekly'"
              class="mb-4 px-3 d-flex flex-column"
            >
              <template
                v-for="date in subject.offeredCourse.appointments.dates"
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
                }}
              </template>
            </p>

            <div
              v-else-if="subject.offeredCourse.appointments.type === 'block'"
              class="mb-4 px-3 d-flex flex-column"
            >
              <p
                v-for="(date, i) in subject.offeredCourse.appointments.dates"
                :key="subject.moduleCode + 'block' + i"
              >
                {{
                  date.from.toLocaleDateString(locale, {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  }) +
                  ' - ' +
                  date.to.toLocaleDateString(locale, {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })
                }}
              </p>
            </div>

            <div
              v-else-if="
                subject.offeredCourse.appointments.type === 'irregular'
              "
              class="mb-4 px-3 d-flex flex-column"
            >
              <p
                v-for="(date, i) in subject.offeredCourse.appointments.dates"
                :key="subject.moduleCode + 'irregular' + i"
              >
                {{
                  date.from.toLocaleString(locale, {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                  }) +
                  ' - ' +
                  date.to.toLocaleTimeString(locale, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                }}
              </p>
            </div>
          </template>

          <template v-if="subject.extraInfo">
            <div class="mb-1 d-flex align-end">
              <VIcon :icon="mdiAlertCircle" class="mr-3" size="32" />
              <h4>{{ t('course-note') }}</h4>
            </div>
            <p class="mb-4 px-3 d-flex flex-column white-space-pre-wrap">
              {{ subject.extraInfo }}
            </p>
          </template>
          <template v-if="subject.offeredCourse?.extraInfo">
            <div class="mb-1 d-flex align-end">
              <VIcon :icon="mdiAlertCircle" class="mr-3" size="32" />
              <h4>{{ t('semester-note') }}</h4>
            </div>
            <p
              class="font-italic mb-4 px-3 d-flex flex-column white-space-pre-wrap"
            >
              {{ subject.offeredCourse.extraInfo }}
            </p>
          </template>
        </VSheet>
      </VCarouselItem>

      <VCarouselItem v-if="subject.infoUrl || pdfSource">
        <VBtn
          :icon="mdiFullscreen"
          class="floating"
          @click="fullscreen = true"
        />
        <VuePdfEmbed
          v-if="pdfSource"
          :class="{
            'pdf-view-dark': theme.global.name.value === 'customDarkTheme',
          }"
          :source="pdfSource"
          class="pdf-view"
          annotation-layer
          text-layer
        />
        <iframe
          v-else-if="subject.infoUrl"
          :src="subject.infoUrl"
          class="pdf-view"
        />
      </VCarouselItem>
    </VCarousel>
    <VDialog v-model:model-value="fullscreen" fullscreen>
      <VBtn
        :icon="mdiFullscreenExit"
        class="floating"
        @click="fullscreen = false"
      />
      <VuePdfEmbed
        v-if="pdfSource"
        :class="{
          'pdf-view-dark': theme.global.name.value === 'customDarkTheme',
        }"
        :source="pdfSource"
        class="pdf-view"
        annotation-layer
        text-layer
      />
      <iframe
        v-else-if="subject.infoUrl"
        :src="subject.infoUrl"
        class="pdf-view"
      />
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.white-space-pre-wrap {
  white-space: pre-wrap;
}

.floating {
  position: absolute;
  top: var(--floating-margin);
  right: var(--floating-margin);
  z-index: 3;
}
.pdf-view {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
}
.pdf-view-dark {
  filter: invert(1);
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2500;
  height: 100vh;
  width: 100vw;
}
</style>

<i18n lang="yaml">
en:
  lecturers: Lecturers
  workload: Workload
  semester-hours: SWS
  credit-points: CPs
  participants: Participants
  appointments: Appointments
  course-note: Note about course
  semester-note: Note about Semester

de:
  lecturers: Dozenten
  workload: Arbeitsaufwand
  semester-hours: SWS
  credit-points: CPs
  participants: Teilnehmer
  appointments: Termine
  course-note: Kurshinweis
  semester-note: Semesterhinweis
</i18n>
