<script setup lang="ts">
import { useAdminStore } from '@/stores/AdminStore'
import { ref } from 'vue'

const adminStore = useAdminStore()

const showModalForm = ref(false)

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
    <VTable>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Professor</th>
          <th class="text-left">Always offered</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.subjects" :key="subject.moduleCode">
          <td>{{ subject.title.en }}</td>
          <td>{{ subject.allLecturers.toString() }}</td>
          <td>
            <VBtn @click="showModalForm = true"> Open Dialog </VBtn>

            <VDialog
              v-model="showModalForm"
              content-class="transparent-modal"
              transition="false"
              width="auto"
            >
              <VCard
                max-width="400"
                prepend-icon="mdi-update"
                text="Your application will relaunch automatically after the update is complete."
                title="Update in progress"
              >
                <template #actions>
                  <VBtn
                    class="ms-auto"
                    text="Ok"
                    @click="showModalForm = false"
                  />
                </template>
              </VCard>
            </VDialog>
          </td>
        </tr>
      </tbody>
      <VBtn @click="saveSelectedSubjects">Save</VBtn>
    </VTable>
  </div>
</template>

<style scoped lang="scss">
.transparent-modal .v-dialog__content {
  background-color: rgba(0, 0, 0, 0.5); /* Adjust opacity as needed */
}
</style>
