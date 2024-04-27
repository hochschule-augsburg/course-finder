<script setup lang="ts">
import { Subject, useEnrollmentStore } from '@/stores/enrollment'
import { reactive } from 'vue'

const enrollmentStore = useEnrollmentStore();

const tableOne: Subject[] = reactive(enrollmentStore.subjects);
const tableTwo: Subject[] = reactive([])

const startDrag = (event: DragEvent, subject: Subject) => {
    console.log(subject);
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('itemID', subject.moduleCode);
    }
}

const onDrop = (event: DragEvent) => {
    const itemID = event.dataTransfer?.getData('itemID');

    const indexInTableOne = tableOne.findIndex((item) => item.moduleCode == itemID);
    const indexInTableTwo = tableTwo.findIndex((item) => item.moduleCode == itemID);

    if (indexInTableOne >= 0) {
        const foundSubject = tableOne.find((item) => item.moduleCode == itemID) as Subject
        tableTwo.push(foundSubject);
        tableOne.splice(indexInTableOne, 1);
        
    } else if (indexInTableTwo >= 0) {
        const foundSubject = tableTwo.find((item) => item.moduleCode == itemID) as Subject
        tableOne.push(foundSubject); 
        tableTwo.splice(indexInTableTwo, 1);
        
    }
}
</script>

<template>
    <VContainer>
        <VRow>
            <VCol cols="12" lg="6">
                <div class="drop-zone"
                @drop="onDrop($event)"
                @dragenter.prevent
                @dragover.prevent >
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in tableOne" :key="subject.moduleCode" class="drag-el"
                            draggable="true"
                            @dragstart="startDrag($event, subject)">
                                <td>{{ subject.title.en }}</td>
                            </tr>   
                        </tbody>
                         
                    </table>
                </div>
            </VCol>
            <VCol>
                <div class="drop-zone"
                @drop="onDrop($event)"
                @dragenter.prevent
                @dragover.prevent >
                    <div v-for="subject in tableTwo" :key="subject.moduleCode" class="drag-el"
                    draggable="true">
                        {{ subject.title.en }}
                    </div>   
                </div>
            </VCol>
        </VRow>
    </VContainer>
    
    
</template>

<style lang="scss">

$backgroundColor: #ecf0f1;
$itemBackgroundColor: #ff266d;
$itemColor: #ffffff;
$paddingValue: 2%;

.drop-zone {
    width: 50%;
    background-color: $backgroundColor;
    padding: $paddingValue;
    min-height: $paddingValue;
}

.drag-el {
    background-color: $itemBackgroundColor;
    color: $itemColor;
    padding: $paddingValue;
}

</style>