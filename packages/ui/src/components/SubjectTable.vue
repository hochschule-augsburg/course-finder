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
              <VCol :class="{ 'title-ellipsis': !expanded }" cols="5">
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
          <SubjectDetails :subject="subject" />
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
  translate: -1.8rem -2rem;
}

.title-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
