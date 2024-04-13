<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { ref } from 'vue'

const enrollmentStore = useEnrollmentStore()
const selectedSubject = ref<number | undefined>(undefined)

function openSubjectDialog(name: string) {
  selectedSubject.value = enrollmentStore.subjects.findIndex(
    (s) => s.name === name,
  )
}
</script>

<template>
  <!-- TODO: replace use subject.id as key instead of name -->
  <div>
    <SubjectDialog :selected-subject="selectedSubject" />
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="subject in enrollmentStore.filteredSubjects"
          :key="subject.name"
          cols="auto"
        >
          <VCard
            :subtitle="subject.prof"
            :title="subject.name"
            height="200"
            width="300"
            hover
            @click="openSubjectDialog(subject.name)"
          >
            <template #append>
              <VCheckbox v-model="subject.selected" @click.stop />
            </template>
            <VCardText>
              <VRow align="end" justify="end" style="height: 7rem">
                <VCol cols="auto" style="text-align: end">
                  <p>
                    <strong>{{ subject.cp }} CP</strong>
                  </p>
                  <p>
                    <strong>{{ subject.sws }} SWS</strong>
                  </p>
                  <p v-if="subject.weekly">
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
                  </p>
                  <p v-else-if="subject.meetings">Blockveranstaltung</p>
                  <p v-else>na</p>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
