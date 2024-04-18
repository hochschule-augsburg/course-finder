<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <VExpansionPanels class="mx-1 my-4" variant="popout">
    <VExpansionPanel
      v-for="subject in enrollmentStore.filteredSubjects"
      :key="subject.moduleCode"
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
                <strong> {{ subject.title.de }}</strong>
              </VCol>
              <VCol cols="3"> {{ subject.semesterHours }} SWS </VCol>
              <VCol
                v-if="subject.offeredCourse.appointments.type === 'weekly'"
                cols="4"
              >
                <template
                  v-for="(date, i) in subject.offeredCourse.appointments.dates"
                  :key="i"
                >
                  <span class="pa8">
                    {{
                      date.from.toLocaleDateString([], {
                        weekday: 'long',
                      })
                    }}
                    <br />
                  </span>
                </template>
              </VCol>
              <VCol
                v-else-if="subject.offeredCourse.appointments.type === 'block'"
              >
                Blockv.
              </VCol>
              <VCol v-else> na </VCol>
            </VRow>
            <VRow no-gutters>
              <VCol cols="5">
                {{
                  subject.Lecturers.map((e) => e.name).join(', ') +
                  (subject.externLecturers.length
                    ? ' Extern: ' + subject.externLecturers.join(', ')
                    : '')
                }}
              </VCol>
              <VCol cols="3"> {{ subject.creditPoints }} CP </VCol>
              <VCol
                v-if="subject.offeredCourse.appointments.type === 'weekly'"
                cols="5"
              >
                <template
                  v-for="(date, i) in subject.offeredCourse.appointments.dates"
                  :key="i"
                >
                  <span>
                    {{
                      date.from.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      }) +
                      ' - ' +
                      date.from.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    }}
                    <br />
                  </span>
                </template>
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
            <!-- @vue-ignore todo -->
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
