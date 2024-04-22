<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/annotationLayer.css'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'

const { subject } = defineProps<{
  subject: Subject
}>()

const { doc } = useVuePdfEmbed({
  source: `/WPFs/${subject.moduleCode}.pdf`,
})
</script>

<template>
  <div>
    <VCarousel
      :show-arrows="false"
      color="#000000"
      height="400"
      hide-delimiter-background
    >
      <VCarouselItem>
        <VSheet
          class="px-4 py-6 overflow-y-auto"
          color="grey-lighten-4"
          height="400"
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
          <p
            v-if="subject.offeredCourse.extraInfo"
            class="mb-4 px-3 d-flex flex-column"
          >
            {{ subject.offeredCourse.extraInfo }}
          </p>
        </VSheet>
      </VCarouselItem>

      <VCarouselItem>
        <VuePdfEmbed
          :source="doc"
          style="height: 25rem; overflow-y: scroll"
          annotation-layer
          text-layer
        />
      </VCarouselItem>
    </VCarousel>
  </div>
</template>
