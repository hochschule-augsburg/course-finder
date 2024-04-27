<script setup lang="ts">
import { reactive } from 'vue'

const newEnrollmentData = reactive({
    start: '',
    end: '',
    title: '',
    description: '',
    offeredCourses: [],
})
</script>

<template>
    
    <VForm>
        <VContainer fluid>
            <VRow justify="center">
                <VCol cols="10">
                    <h1>Create enrollment</h1>
                    <VTextField v-model="newEnrollmentData.start"
                    label="Start date"
                    required
                    type="datetime-local">
                    </VTextField>
                </VCol>
            </VRow>
            <VRow justify="center">
                <VCol cols="10" >
                    <VTextField v-model="newEnrollmentData.end"
                    label="End date"
                    required
                    type="datetime-local">
                    </VTextField>
                </VCol>
            </VRow>
            <VRow justify="center">
                <VCol cols="10" >
                    <VTextField v-model="newEnrollmentData.title"
                    label="Title"
                    required>
                    </VTextField>
                </VCol>
            </VRow>
            <VRow justify="center">
                <VCol cols="10" >
                    <VTextarea v-model="newEnrollmentData.description"
                    clearable
                    label="Description"
                    required>
                    </VTextarea>
                    <VBtn justify="center" text="Create enrollment"></VBtn>
                </VCol>
            </VRow>
        </VContainer>
        
    </VForm>
</template>