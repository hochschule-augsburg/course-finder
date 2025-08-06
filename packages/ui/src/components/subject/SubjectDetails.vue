<script setup lang="ts">
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiCalendar,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiLectern,
  mdiTypewriter,
} from '@mdi/js'
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VuePdfEmbed from 'vue-pdf-embed'
import { useDisplay, useTheme } from 'vuetify'
import {
  VBtn,
  VCarousel,
  VCarouselItem,
  VDialog,
  VIcon,
  VSheet,
} from 'vuetify/components'

import type { Subject } from '@/stores/CoursesStore'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

import { useUserStore } from '@/stores/UserStore'
import { trpc } from '@/trpc'

const props = defineProps<{
  subject: Subject
}>()

const { locale, t } = useI18n()
const { mobile } = useDisplay()

const userStore = useUserStore()

const { state: pdfSource } = useAsyncState(
  async () =>
    await trpc.course.getPdf.query({ moduleCode: props.subject.moduleCode }),
  undefined,
)
const theme = useTheme()
const fullscreen = ref<'infoUrl' | 'maPdf' | 'pdf' | undefined>()

const userDegree = computed(() => userStore.user?.Student?.finalDegree)

const exam = computed(() => {
  let exam: null | string = props.subject.exam
  if (!userDegree.value && props.subject.exam && props.subject.maExam) {
    exam = `
#### Bachelor
${props.subject.exam}
#### Master
${props.subject.maExam}
    `
  }
  if (userDegree.value === 'Master') {
    exam = props.subject.maExam || props.subject.exam
  }
  return exam?.replaceAll('•', '-')
})
</script>

<template>
  <div class="cf-subject-details">
    <VCarousel
      :height="mobile ? '100%' : '68vh'"
      :show-arrows="false"
      :touch="false"
      hide-delimiter-background
    >
      <VCarouselItem>
        <VSheet class="information-list" color="secondary" height="100%">
          <section>
            <div class="icon-heading">
              <VIcon :icon="mdiLectern" size="32" />
              <h4>{{ t('lecturers') }}</h4>
            </div>
            <p>{{ subject.lecturers.join(', ') }}</p>
          </section>

          <section>
            <div class="icon-heading">
              <VIcon :icon="mdiAccountMultiple" size="32" />
              <h4>{{ t('workload') }}</h4>
            </div>
            <p>{{ subject.semesterHours }} {{ t('semester-hours') }}</p>
            <p>{{ subject.creditPoints }} {{ t('credit-points') }}</p>
          </section>

          <section v-if="exam">
            <div class="icon-heading">
              <VIcon :icon="mdiTypewriter" size="32" />
              <h4>{{ t('exam') }}</h4>
            </div>
            <CfMarkdown :source="exam" class="markdown" />
          </section>

          <template v-if="subject.offeredCourse">
            <section>
              <div class="icon-heading">
                <VIcon :icon="mdiAccountMultiple" size="32" />
                <h4>{{ t('participants') }}</h4>
              </div>
              <p>
                {{
                  (subject.offeredCourse.minParticipants ?? '?') +
                  ' - ' +
                  (subject.offeredCourse.maxParticipants || '∞')
                }}
              </p>
            </section>

            <section>
              <div class="icon-heading">
                <VIcon :icon="mdiCalendar" size="32" />
                <h4>{{ t('appointments') }}</h4>
              </div>
              <template
                v-if="subject.offeredCourse.appointments.type === 'weekly'"
              >
                <p>
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
              </template>

              <template
                v-else-if="subject.offeredCourse.appointments.type === 'block'"
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
              </template>

              <template
                v-else-if="
                  subject.offeredCourse.appointments.type === 'irregular'
                "
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
              </template>
            </section>
          </template>

          <section v-if="subject.extraInfo">
            <div class="icon-heading">
              <VIcon :icon="mdiAlertCircle" size="32" />
              <h4>{{ t('course-note') }}</h4>
            </div>
            <CfMarkdown :source="subject.extraInfo" class="markdown" />
          </section>

          <section v-if="subject.offeredCourse?.extraInfo">
            <div class="icon-heading">
              <VIcon :icon="mdiAlertCircle" size="32" />
              <h4>{{ t('semester-note') }}</h4>
            </div>
            <CfMarkdown
              :source="subject.offeredCourse.extraInfo"
              class="markdown"
            />
          </section>
        </VSheet>
      </VCarouselItem>

      <VCarouselItem
        v-if="(userDegree !== 'Master' || !pdfSource?.maPdf) && pdfSource?.pdf"
      >
        <VBtn
          v-if="!mobile"
          :icon="mdiFullscreen"
          class="floating"
          @click="fullscreen = 'pdf'"
        />
        <VuePdfEmbed
          :class="{
            'pdf-view-dark': theme.global.name.value === 'customDarkTheme',
          }"
          :source="pdfSource?.pdf"
          class="pdf-view"
          annotation-layer
          text-layer
        />
      </VCarouselItem>
      <VCarouselItem v-if="userDegree !== 'Bachelor' && pdfSource?.maPdf">
        <VBtn
          v-if="!mobile"
          :icon="mdiFullscreen"
          class="floating"
          @click="fullscreen = 'maPdf'"
        />
        <VuePdfEmbed
          :class="{
            'pdf-view-dark': theme.global.name.value === 'customDarkTheme',
          }"
          :source="pdfSource?.maPdf"
          class="pdf-view"
          annotation-layer
          text-layer
        />
      </VCarouselItem>
      <VCarouselItem v-if="subject.infoUrl">
        <VBtn
          v-if="!mobile"
          :icon="mdiFullscreen"
          class="floating"
          @click="fullscreen = 'infoUrl'"
        />
        <iframe :src="subject.infoUrl" class="pdf-view" />
      </VCarouselItem>
    </VCarousel>
    <VDialog
      v-if="!mobile"
      :model-value="!!fullscreen"
      fullscreen
      @update:model-value="fullscreen = undefined"
    >
      <VBtn
        :icon="mdiFullscreenExit"
        class="floating"
        @click="fullscreen = undefined"
      />
      <VuePdfEmbed
        v-if="fullscreen === 'pdf' || fullscreen === 'maPdf'"
        :class="{
          'pdf-view-dark': theme.global.name.value === 'customDarkTheme',
        }"
        :source="pdfSource?.[fullscreen]"
        class="pdf-view"
        annotation-layer
        text-layer
      />
      <iframe
        v-else-if="fullscreen === 'infoUrl' && subject.infoUrl"
        :src="subject.infoUrl"
        class="pdf-view"
      />
    </VDialog>
  </div>
</template>

<style scoped lang="scss">
.cf-subject-details {
  height: 100%;
}
.information-list {
  display: flex;
  flex-direction: column;
  gap: var(--element-spacing-m);
  padding: var(--element-spacing-m);
  border-radius: 4%;
  padding-bottom: 50px;
  overflow-y: auto;

  section > p,
  .markdown {
    margin-left: var(--element-spacing-m);
  }
}

.icon-heading {
  display: flex;
  align-items: flex-end;
  gap: var(--element-spacing-s);
  margin-bottom: var(--element-spacing-s);
}
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
  exam: Exam
de:
  lecturers: Dozenten
  workload: Arbeitsaufwand
  semester-hours: SWS
  credit-points: CPs
  participants: Teilnehmer
  appointments: Termine
  course-note: Kurshinweis
  semester-note: Semesterhinweis
  exam: Prüfung
</i18n>
