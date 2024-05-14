<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { trpc } from '@/api/trpc'
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/annotationLayer.css'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'
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
    <VCarousel
      :show-arrows="false"
      color="#000000"
      height="68vh"
      hide-delimiter-background
    >
      <VCarouselItem>
        <VSheet
          class="px-4 py-6 overflow-y-auto"
          color="rgb(var(--v-theme-secondary))"
          height="100%"
          rounded="lg"
        >
          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-lectern</VIcon>
            <h4>{{ t('lecturers') }}</h4>
          </div>
          <div>
            <p class="mb-4 px-3">
              {{ subject.lecturers.join(', ') }}
            </p>
          </div>
          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-account-multiple</VIcon>
            <h4>{{ t('workload') }}</h4>
          </div>
          <div class="mb-4 px-3 d-flex flex-column">
            <p>{{ subject.semesterHours }} {{ t('semester-hours') }}</p>
            <p>{{ subject.creditPoints }} {{ t('credit-points') }}</p>
          </div>
          <template v-if="subject.offeredCourse">
            <div class="mb-1 d-flex align-end">
              <VIcon class="mr-3" size="32">mdi-account-multiple</VIcon>
              <h4>{{ t('participants') }}</h4>
            </div>
            <p class="mb-4 px-3">
              {{
                subject.offeredCourse.minParticipants +
                '-' +
                subject.offeredCourse.maxParticipants
              }}
            </p>

            <div class="mb-1 d-flex align-end">
              <VIcon class="mr-3" size="32">mdi-calendar</VIcon>
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

          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-alert-circle</VIcon>
            <h4>{{ t('note') }}</h4>
          </div>
          <p v-if="subject.extraInfo" class="mb-4 px-3 d-flex flex-column">
            {{ subject.extraInfo }}
          </p>
          <p
            v-if="subject.offeredCourse?.extraInfo"
            class="font-italic mb-4 px-3 d-flex flex-column"
          >
            {{ subject.offeredCourse.extraInfo }}
          </p>
        </VSheet>
      </VCarouselItem>

      <VCarouselItem v-if="subject.infoUrl || pdfSource">
        <VBtn
          class="floating"
          icon="mdi-fullscreen"
          @click="fullscreen = true"
        />
        <div
          v-if="theme.global.name.value === 'customDarkTheme'"
          class="pdf-view-dark"
        />
        <VuePdfEmbed
          v-if="pdfSource"
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
        class="floating"
        icon="mdi-fullscreen-exit"
        @click="fullscreen = false"
      />
      <div
        v-if="theme.global.name.value === 'customDarkTheme'"
        class="pdf-view-dark"
      />
      <VuePdfEmbed
        v-if="pdfSource"
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
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  mix-blend-mode: difference;
  z-index: 1;
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
  note: Note

de:
  lecturers: Dozenten
  workload: Arbeitsaufwand
  semester-hours: SWS
  credit-points: CPs
  participants: Teilnehmer
  appointments: Termine
  note: Hinweis
</i18n>
