<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <div class="ma-1">
    <!-- <h1>This is the Subject Table</h1> -->
    <VExpansionPanels variant="popout" multiple>
      <VExpansionPanel
        v-for="subject in enrollmentStore.filteredSubjects"
        :key="subject.name"
      >
        <VExpansionPanelTitle>
          <VContainer style="padding: 0px">
            <VRow no-gutters>
              <VCol cols="5" style="overflow-wrap: break-word; hyphens: auto">
                <strong>{{ subject.name }}</strong>
              </VCol>
              <VCol cols="3"> {{ subject.sws }} SWS </VCol>
              <VCol v-if="subject.weekly" cols="4">
                {{
                  new Date(subject.weekly.from).toLocaleDateString([], {
                    weekday: 'long',
                  })
                }}
              </VCol>
              <VCol v-else-if="subject.meetings"> Blockv. </VCol>
              <VCol v-else> na </VCol>
            </VRow>
            <VRow no-gutters>
              <VCol cols="5">
                {{ subject.prof }}
              </VCol>
              <VCol cols="3"> {{ subject.cp }} CP </VCol>
              <VCol v-if="subject.weekly" cols="4">
                {{
                  new Date(subject.weekly.from).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  }) +
                  ' - ' +
                  new Date(subject.weekly.to).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                }}
              </VCol>
            </VRow>
          </VContainer>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VContainer>
            <VRow
              ><VIcon>mdi-account-multiple</VIcon
              >{{ subject.minTnm + '-' + subject.maxTnm }}</VRow
            >
            <VRow v-if="subject.weekly">
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
            <VRow><VIcon>mdi-text-box</VIcon>{{ subject.description }}</VRow>
            <VRow><VIcon>mdi-alert-circle</VIcon>{{ subject.info }}</VRow>
            <VRow><VIcon>mdi-book</VIcon>{{ subject.moduleMan }}</VRow>
          </VContainer>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
