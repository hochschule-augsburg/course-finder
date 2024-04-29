<script setup lang="ts">
import type { Subject } from '@/stores/enrollment'

import { useEnrollmentStore } from '@/stores/enrollment'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn } from 'vuetify/components'
import { VForm } from 'vuetify/components/VForm'

import '../styles/settings.scss'

const { locale } = useI18n()

const enrollmentStore = useEnrollmentStore()

const visible = defineModel<boolean>()

const form = ref<VForm | undefined>(undefined)
const loading = ref<boolean>(false)
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)

function openSubjectDialog(moduleCode: string) {
  selectedSubject.value = enrollmentStore.subjects.find(
    (s) => s.moduleCode === moduleCode,
  )
  showSubjectDialog.value = true
}

function removeSubject(moduleCode: string) {
  const subject = enrollmentStore.subjects.find(
    (s) => s.moduleCode === moduleCode,
  )

  if (subject) {
    subject.selected = false
  }
}

function back() {
  visible.value = false
}

// TODO better error msgs + i18n
const pointInputRules = [
  (i: string) => !!i || 'Input is required',
  (i: string) => /^[1-9]\d*$/.test(i) || 'Input must be an integer', // check is input is valid int > 0
]

async function validate() {
  const formValidation = await form.value?.validate()

  if (!formValidation?.valid) {
    return
  }

  if (
    enrollmentStore.selectedSubjects.length > 0 && // make it possible to reset enrollment
    enrollmentStore.selectedSubjects.reduce((a, c) => a + c.points, 0) !==
      enrollmentStore.maxPoints
  ) {
    form.value?.items.forEach((i) => i.errorMessages.push('maxPoints = 1000'))
    return
  }

  loading.value = true

  try {
    await enrollmentStore.enroll()
    await enrollmentStore.init()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }

  visible.value = false
}

function reset() {
  form.value?.reset()
}
</script>

<template>
  <div
    v-if="visible"
    class="d-flex flex-column align-center justify-center container"
  >
    <SubjectDialog v-model="showSubjectDialog" :subject="selectedSubject" />
    <div class="d-flex align-start formHead">
      <VBtn
        prepend-icon="mdi-arrow-left"
        text="zurück"
        variant="plain"
        @click="back"
      />
    </div>
    <VSheet
      class="pa-5"
      color="rgb(var(--v-theme-secondary))"
      elevation="1"
      max-width="var(--dialog-max-width)"
      rounded="lg"
      width="var(--dialog-width)"
    >
      <VForm ref="form">
        <VTextField
          v-for="subject in enrollmentStore.selectedSubjects"
          v-model.number="subject.points"
          :key="subject.moduleCode"
          :label="locale === 'de' ? subject.title.de : subject.title.en"
          :rules="pointInputRules"
          append-icon="mdi-delete"
          append-inner-icon="mdi-book-information-variant"
          required
          @click:append="removeSubject(subject.moduleCode)"
          @click:append-inner="openSubjectDialog(subject.moduleCode)"
        />

        <VRow align="center" class="mt-2 px-3">
          <VBtn icon="mdi-restore" size="small" @click="reset" />
          <VSpacer />
          <VBtn :loading="loading" text="Anmelden" @click="validate" />
        </VRow>
      </VForm>
    </VSheet>
  </div>
</template>

<style scoped lang="scss">
.container {
  height: 100%;
}
.formHead {
  width: var(--dialog-width);
  max-width: var(--dialog-max-width);
}
</style>
