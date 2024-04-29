<script setup lang="ts">
import type { Subject } from '@/stores/AdminStore'

import { useAdminStore } from '@/stores/AdminStore'
import { reactive } from 'vue'

const enrollmentStore = useAdminStore()

const tableOne: Subject[] = reactive(enrollmentStore.subjects)
//TODO: Always offered courses should be automatically in tableTwo
const tableTwo: Subject[] = reactive([])

function startDrag(event: DragEvent, subject: Subject): void {
  console.log(subject)

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('itemID', subject.moduleCode)
  }
}

function onDrop(event: DragEvent): void {
  const itemID = event.dataTransfer?.getData('itemID')

  const indexInTableOne = tableOne.findIndex(
    (item) => item.moduleCode === itemID,
  )
  const indexInTableTwo = tableTwo.findIndex(
    (item) => item.moduleCode === itemID,
  )

  if (indexInTableOne >= 0) {
    const foundSubject = tableOne.find(
      (item) => item.moduleCode === itemID,
    ) as Subject
    tableTwo.push(foundSubject)
    tableOne.splice(indexInTableOne, 1)
  } else if (indexInTableTwo >= 0) {
    const foundSubject = tableTwo.find(
      (item) => item.moduleCode === itemID,
    ) as Subject
    tableOne.push(foundSubject)
    tableTwo.splice(indexInTableTwo, 1)
  }
}
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12" lg="6">
        <div
          class="drop-zone"
          @dragenter.prevent
          @dragover.prevent
          @drop="onDrop($event)"
        >
          <div>Course</div>
          <div
            v-for="subject in tableOne"
            :key="subject.moduleCode"
            class="drag-el"
            draggable="true"
            @dragstart="startDrag($event, subject)"
          >
            {{ subject.title.en }}
          </div>
        </div>
      </VCol>
      <VCol>
        <div
          class="drop-zone"
          @dragenter.prevent
          @dragover.prevent
          @drop="onDrop($event)"
        >
          <div>Offered courses</div>
          <div
            v-for="subject in tableTwo"
            :key="subject.moduleCode"
            class="drag-el"
            draggable="true"
            @dragstart="startDrag($event, subject)"
          >
            {{ subject.title.en }}
          </div>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">
$backgroundColor: #ecf0f1;
$itemBackgroundColor: #ff266d;
$itemColor: #ffffff;
$paddingValue: 2%;

.drop-zone {
  width: 70%;
  background-color: $backgroundColor;
  padding: $paddingValue;
  min-height: 10%;
}

.drag-el {
  background-color: $itemBackgroundColor;
  color: $itemColor;
  padding: $paddingValue;
}
</style>
