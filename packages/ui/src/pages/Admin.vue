<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { VBtn, VTable } from 'vuetify/components'

const enrollmentStore = useEnrollmentStore();
const subjects = enrollmentStore.subjects;
const phase = enrollmentStore.currentPhase;

function formatDate(dateString: string | undefined) {
  if (!dateString) {
    return ''; 
  }
  const date = new Date(dateString);
  const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:00`;
  return formattedDate;
}

function getRemainingTime(end: string | undefined) {
  if (!end) {
    return '';
  }
  const currentDT = new Date();
  const endDT = new Date(end);

  const timeDifferenceMs = endDT.getTime() - currentDT.getTime();
  const seconds = Math.floor(timeDifferenceMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes,`;
}
</script>

<template>
  <div>
    <h1>Administration</h1>
    <div class="current-phase">
      <h2>Current phase: {{ phase?.title.en }}</h2>
      Start: {{ formatDate(phase?.start.toString()) }} <br />
      End: {{ formatDate(phase?.end.toString()) }} <br />
      Remaining Time: {{ getRemainingTime(phase?.end.toString()) }}
    </div>
    <div>
      <h2>Available subjects</h2>
      <VTable>
      <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Professor
          </th>
          <th class="text-left">
            Always offered
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="subject in subjects"
          :key="subject.moduleCode"
        >
          <td>{{ subject.title.en }}</td>
          <td>{{ subject.allLecturers.toString() }}</td> 
          <td>
            <input type="checkbox" :value="subject.moduleCode">
          </td>
        </tr>
      </tbody>
      <VBtn>Save</VBtn>
    </VTable>
    </div>
    <VBtn text="Create enrollment phase" />
  </div>
</template>
