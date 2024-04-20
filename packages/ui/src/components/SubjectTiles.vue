<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

import { useEnrollmentStore } from '@/stores/enrollment'
import { ref } from 'vue'

const enrollmentStore = useEnrollmentStore()
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)

function openSubjectDialog(moduleCode: string) {
  selectedSubject.value = enrollmentStore.subjects.find(
    (s) => s.moduleCode === moduleCode,
  )
  showSubjectDialog.value = true
}
</script>

<template>
  <div>
    <SubjectDialog v-model="showSubjectDialog" :subject="selectedSubject" />
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="subject in enrollmentStore.filteredSubjects"
          :key="subject.moduleCode"
          cols="auto"
        >
          <VCard
            :subtitle="
              subject.Lecturers.map((e) => e.name).join(', ') +
              subject.externLecturers.join(', ')
            "
            :title="subject.title.de /*todo i18n */"
            height="200"
            width="300"
            hover
            @click="openSubjectDialog(subject.moduleCode)"
          >
            <template #append>
              <VCheckbox v-model="subject.selected" @click.stop />
            </template>
            <VCardText>
              <VRow align="end" justify="end" style="height: 7rem">
                <VCol cols="auto" style="text-align: end">
                  <p>
                    <strong>{{ subject.creditPoints }} CP</strong>
                  </p>
                  <p>
                    <strong>{{ subject.semesterHours }} SWS</strong>
                  </p>
                  <p
                    v-if="subject.offeredCourse.appointments.type === 'weekly'"
                  >
                    <template
                      v-for="(date, i) in subject.offeredCourse.appointments
                        .dates"
                      :key="i"
                    >
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
                      }}<br />
                    </template>
                  </p>
                  <p
                    v-else-if="
                      subject.offeredCourse.appointments.type === 'block'
                    "
                  >
                    Blockveranstaltung
                  </p>
                  <p v-else>Irregulär</p>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
