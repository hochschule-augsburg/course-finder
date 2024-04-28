<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const enrollmentStore = useEnrollmentStore()
let selectedSubjects: string[] = []

function saveSelectedSubjects() {
  selectedSubjects = []
  const checkboxes = document.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  )
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const moduleCode = checkbox.value
      selectedSubjects.push(moduleCode)
    }
  })
  //TODO: Send data to backend or save in frontend?
  console.log(selectedSubjects)
}
</script>

<template>
  <div>
    <br />
    <h2>Available subjects</h2>
    <VTable>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Professor</th>
          <th class="text-left">Always offered</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="subject in enrollmentStore.filteredSubjects"
          :key="subject.moduleCode"
        >
          <td>{{ subject.title.en }}</td>
          <td>{{ subject.allLecturers.toString() }}</td>
          <td>
            <input :value="subject.moduleCode" type="checkbox" />
          </td>
        </tr>
      </tbody>
      <VBtn @click="saveSelectedSubjects">Save</VBtn>
    </VTable>
  </div>
</template>
