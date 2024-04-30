<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

import { trpc } from '@/api/trpc'
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/annotationLayer.css'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'

const props = defineProps<{
  subject: Subject
}>()

const { state: pdfSource } = useAsyncState(
  async () =>
    (await trpc.course.getPdf.query({ moduleCode: props.subject.moduleCode }))
      .pdf,
  undefined,
)
const fullscreen = ref(false)
</script>

<template>
  <div>
    <VCarousel
      :show-arrows="false"
      color="#000000"
      height="60vh"
      hide-delimiter-background
    >
      <VCarouselItem>
        <VSheet
          class="px-4 py-6 overflow-y-auto"
          color="grey-lighten-4"
          height="100%"
          rounded="lg"
        >
          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-account-multiple</VIcon>
            <h4>Arbeitsaufwand</h4>
          </div>
          <div class="mb-4 px-3 d-flex flex-column">
            <p>{{ subject.semesterHours }} SWS</p>
            <p>{{ subject.creditPoints }} CPs</p>
          </div>
          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-account-multiple</VIcon>
            <h4>Teilnehmer</h4>
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
            <h4>Termine</h4>
          </div>
          <p
            v-if="subject.offeredCourse.appointments.type === 'weekly'"
            class="mb-4 px-3 d-flex flex-column"
          >
            <template v-for="date in subject.offeredCourse.appointments.dates">
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
                date.from.toLocaleDateString([], {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                }) +
                ' - ' +
                date.to.toLocaleDateString([], {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })
              }}
            </p>
          </div>

          <div
            v-else-if="subject.offeredCourse.appointments.type === 'irregular'"
            class="mb-4 px-3 d-flex flex-column"
          >
            <p
              v-for="(date, i) in subject.offeredCourse.appointments.dates"
              :key="subject.moduleCode + 'irregular' + i"
            >
              {{
                date.from.toLocaleDateString([], {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                }) +
                ' - ' +
                date.to.toLocaleDateString([], {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })
              }}
            </p>
          </div>

          <div class="mb-1 d-flex align-end">
            <VIcon class="mr-3" size="32">mdi-alert-circle</VIcon>
            <h4>Hinweis</h4>
          </div>
          <p v-if="subject.extraInfo" class="mb-4 px-3 d-flex flex-column">
            {{ subject.extraInfo }}
          </p>
          <p
            v-if="subject.offeredCourse.extraInfo"
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
        <VuePdfEmbed
          v-if="pdfSource"
          :source="pdfSource"
          class="pdfView"
          annotation-layer
          text-layer
        />
        <iframe
          v-else-if="subject.infoUrl"
          :src="subject.infoUrl"
          class="pdfView"
        />
      </VCarouselItem>
    </VCarousel>
    <VDialog v-model:model-value="fullscreen" fullscreen>
      <VBtn
        class="floating"
        icon="mdi-fullscreen-exit"
        @click="fullscreen = false"
      />
      <VuePdfEmbed
        v-if="pdfSource"
        :source="pdfSource"
        class="pdfView"
        annotation-layer
        text-layer
      />
      <iframe
        v-else-if="subject.infoUrl"
        :src="subject.infoUrl"
        class="pdfView"
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
.pdfView {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
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
