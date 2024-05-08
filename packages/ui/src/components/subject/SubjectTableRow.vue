<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useI18n } from 'vue-i18n'
import {
  VCol,
  VContainer,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VRow,
} from 'vuetify/components'

import EnrollCheckbox from './EnrollCheckbox.vue'
defineProps<{ subject: Subject }>()

const { locale } = useI18n()
</script>

<template>
  <div>
    <VExpansionPanelTitle
      class="hoverable-panel"
      color="rgb(var(--v-theme-secondary))"
    >
      <template #default="{ expanded }">
        <EnrollCheckbox
          v-if="subject.offeredCourse"
          :subject
          class="checkbox"
        />
        <VContainer class="ma-0">
          <VRow no-gutters>
            <VCol :class="{ 'title-ellipsis': !expanded }" cols="5">
              <strong class="v-card-title">
                {{ locale === 'de' ? subject.title.de : subject.title.en }}
              </strong>
            </VCol>
            <VCol cols="3"> {{ subject.semesterHours }} SWS </VCol>
            <template v-if="subject.offeredCourse">
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
            </template>
          </VRow>
          <VRow no-gutters>
            <VCol class="v-card-subtitle" cols="5">
              {{ subject.lecturers.join(', ') }}
            </VCol>
            <VCol cols="3"> {{ subject.creditPoints }} CP </VCol>
            <template v-if="subject.offeredCourse">
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
            </template>
          </VRow>
        </VContainer>
      </template>
    </VExpansionPanelTitle>
    <VExpansionPanelText class="pa-0 pb-3 px-3">
      <SubjectDetails :subject="subject" />
    </VExpansionPanelText>
  </div>
</template>

<style scoped lang="scss">
.checkbox {
  position: absolute;
  top: var(--element-spacing-xs);
  left: var(--element-spacing-xs);
}

.title-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
