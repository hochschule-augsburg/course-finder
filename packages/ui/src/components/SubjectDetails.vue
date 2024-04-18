<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

const { subject } = defineProps<{
  subject: Subject
}>()
</script>

<template>
  <div>
    <VRow class="py-3">
      <VIcon>mdi-account-multiple</VIcon>
      {{
        subject.offeredCourse.minParticipants +
        '-' +
        subject.offeredCourse.minParticipants
      }}
    </VRow>
    <VRow
      v-if="subject.offeredCourse.appointments.type === 'weekly'"
      class="my-3"
    >
      <VIcon>mdi-calendar</VIcon>
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
    </VRow>
    <VRow
      v-else-if="subject.offeredCourse.appointments.type === 'block'"
      v-for="(date, i) in subject.offeredCourse.appointments.dates"
      :key="subject.moduleCode + i"
      class="my-3"
    >
      <VIcon>mdi-calendar</VIcon>
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
    </VRow>
    <VRow class="my-3">
      <!-- TODO: scrollable container or show less/more if too long -->
      <VIcon>mdi-text-box</VIcon>{{ subject.description.de }}
    </VRow>
    <VRow v-if="subject.offeredCourse.extraInfo" class="my-3">
      <VIcon>mdi-alert-circle</VIcon>{{ subject.offeredCourse.extraInfo }}
    </VRow>
  </div>
</template>
