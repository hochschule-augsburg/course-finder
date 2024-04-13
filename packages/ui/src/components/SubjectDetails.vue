<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

const { subject } = defineProps<{
  subject: Subject
}>()
</script>

<template>
  <div>
    <VRow class="py-3">
      <VIcon>mdi-account-multiple</VIcon
      >{{ subject.minTnm + '-' + subject.maxTnm }}
    </VRow>
    <VRow v-if="subject.weekly" class="my-3">
      <VIcon>mdi-calendar</VIcon>
      {{
        new Date(subject.weekly.from).toLocaleDateString([], {
          weekday: 'long',
          hour: 'numeric',
          minute: '2-digit',
        }) +
        ' - ' +
        new Date(subject.weekly.to).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      }}
    </VRow>
    <VRow
      v-else-if="subject.meetings"
      v-for="(meeting, i) in subject.meetings"
      :key="subject.name + i"
      class="my-3"
    >
      <VIcon>mdi-calendar</VIcon>
      {{
        new Date(meeting.from).toLocaleDateString([], {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }) +
        ' - ' +
        new Date(meeting.to).toLocaleDateString([], {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      }}
    </VRow>
    <VRow class="my-3">
      <!-- TODO: scrollable container or show less/more if too long -->
      <VIcon>mdi-text-box</VIcon>{{ subject.description }}
    </VRow>
    <VRow v-if="subject.info" class="my-3">
      <VIcon>mdi-alert-circle</VIcon>{{ subject.info }}
    </VRow>
  </div>
</template>
