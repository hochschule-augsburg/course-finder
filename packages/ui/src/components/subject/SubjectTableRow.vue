<script lang="ts" setup>
import type { Subject } from '@/stores/CoursesStore'

import { useCourseEnroll } from '@/stores/EnrollmentStore'
import { useI18n } from 'vue-i18n'

import { dialogService } from '../DialogService'

const props = defineProps<{ subject: Subject }>()

const { locale } = useI18n()

const { modelValue: enrolled, update: updateEnrolled } = useCourseEnroll(
  props.subject,
)

async function handleUpdateEnroll() {
  if (enrolled.value?.points) {
    const result = await new Promise((resolve) =>
      dialogService.showDialog({
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
        text: 'points-get-lost',
        title: 'confirm-action',
      }),
    )
    if (!result) {
      // TODO check box ist blöd
      return
    }
  }
  updateEnrolled(!enrolled.value)
}
</script>

<template>
  <div>
    <VExpansionPanelTitle
      class="hoverable-panel"
      color="rgb(var(--v-theme-secondary))"
    >
      <template #default="{ expanded }">
        <VCheckbox
          v-if="subject.offeredCourse"
          :model-value="!!enrolled"
          class="checkbox"
          hide-details
          @click.stop
          @update:model-value="handleUpdateEnroll"
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
  translate: -1.8rem -2rem;
}

.title-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
