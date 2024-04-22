<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { useI18n } from 'vue-i18n'

const enrollmentStore = useEnrollmentStore()
const { locale } = useI18n()
</script>

<template>
  <VExpansionPanels class="px-1 py-4" variant="popout">
    <VExpansionPanel
      v-for="subject in enrollmentStore.filteredSubjects"
      :key="subject.moduleCode"
    >
      <VExpansionPanelTitle
        class="hoverable-panel"
        color="rgb(var(--v-theme-secondary))"
      >
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
                <strong class="v-card-title">
                  {{ locale === 'de' ? subject.title.de : subject.title.en }}
                </strong>
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
                  <span>
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
                Blockveranstaltung
              </VCol>
              <VCol v-else> Irregulär </VCol>
            </VRow>
            <VRow no-gutters>
              <VCol class="v-card-subtitle" cols="5">
                {{ subject.allLecturers.join(', ') }}
              </VCol>
              <VCol cols="3"> {{ subject.creditPoints }} CP </VCol>
              <VCol
                v-if="subject.offeredCourse.appointments.type === 'weekly'"
                cols="4"
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
      <VExpansionPanelText class="pa-0 pb-3 px-3">
        <SubjectDetails :subject="subject" />
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
