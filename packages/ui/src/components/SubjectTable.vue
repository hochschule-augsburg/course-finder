<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <VExpansionPanels class="ma-1" variant="popout">
    <VExpansionPanel
      v-for="subject in enrollmentStore.filteredSubjects"
      :key="subject.name"
    >
      <VExpansionPanelTitle>
        <template #default="{ expanded }">
          <VCheckbox
            v-model="subject.selected"
            class="checkbox"
            hide-details
            @click.stop
          />
          <VContainer class="ma-0">
            <VRow no-gutters>
              <VCol :class="expanded ? '' : 'titleEllipsis'" cols="5">
                <strong> {{ subject.name }}</strong>
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
        </template>
      </VExpansionPanelTitle>
      <VExpansionPanelText>
        <VContainer class="mx-2">
          <VRow class="my-3">
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
          <VRow class="my-3">
            <VIcon>mdi-book</VIcon>
            <a :href="subject.moduleMan" target="_blank">
              Modulhandbuch, S. x
            </a>
          </VRow>
        </VContainer>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<style scoped lang="scss">
.checkbox {
  position: absolute;
  top: -13px;
  left: -5px;
}

.titleEllipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
