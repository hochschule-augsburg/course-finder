<script lang="ts" setup>
import { mdiPencil } from '@mdi/js'
import { ref, toRaw, watchEffect } from 'vue'
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VDialog,
  VDivider,
  VRow,
  VSpacer,
  VSwitch,
  VTextarea,
  VTextField,
} from 'vuetify/components'

import type { Course } from '@/stores/admin/AdminCoursesStore'

import { dialogService } from '../DialogService'

const props = defineProps<{
  onTheFly?: boolean
  selectedSubject?: Course
  visible: boolean
}>()
const emit = defineEmits<{ cancel: []; submit: [Course | undefined] }>()
const formData = ref<
  Omit<Course, 'lecturers' | 'varyingCP'> & {
    lecturers: string
    varyingCP: string
  }
>()

watchEffect(() => {
  if (props.selectedSubject && props.visible) {
    formData.value = {
      ...structuredClone(toRaw(props.selectedSubject)),
      lecturers: props.selectedSubject.lecturers.join(', '),
      varyingCP: varyingCPToString(props.selectedSubject.varyingCP),
    }
  }
})

function deleteSubject() {
  dialogService.showDialog({
    onCancel: () => {},
    onConfirm: () => emit('submit', undefined),
    text: 'Möchten Sie diesen Kurs wirklich löschen?',
    title: 'Bestätigung',
  })
}

function parseVaryingCP(input: string) {
  const dictionary: { [key: string]: number } = {}
  const pairs = input
    .split(',')
    .map((pair) => pair.trim())
    .filter((item) => item !== '')

  pairs.forEach((pair) => {
    const [key, value] = pair.split(':').map((item) => item.trim())
    dictionary[key] = Number(value)
  })
  return dictionary
}

function submit() {
  if (!formData.value) {
    return
  }
  emit('submit', {
    ...formData.value,
    creditPoints: Number(formData.value.creditPoints),
    lecturers: formData.value.lecturers
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== ''),
    semesterHours: Number(formData.value.semesterHours),
    varyingCP: parseVaryingCP(formData.value.varyingCP),
  })
}

function varyingCPToString(varyingCP: unknown) {
  if (
    typeof varyingCP === 'object' &&
    varyingCP !== null &&
    !Array.isArray(varyingCP)
  ) {
    const keyValuePairs = Object.entries(varyingCP).map(([key, value]) => {
      return `${key}: ${value}`
    })

    const resultString = keyValuePairs.join(', ')
    return resultString
  }
  return ''
}

const moduleCodeRequiredRule = [(i: string) => !!i || 'Feld erforderlich']
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="1000"
    min-width="auto"
    transition="false"
    @update:model-value="$emit('cancel')"
  >
    <VCard
      v-if="formData"
      :prepend-icon="mdiPencil"
      :title="'Bearbeiten - ' + selectedSubject?.title.de"
    >
      <template v-if="!selectedSubject?.moduleCode" #title>
        <div class="d-flex align-center" style="width: 35%">
          <span>Neuer Kurs &nbsp;</span>
          <VTextField
            v-model="formData.moduleCode"
            :rules="moduleCodeRequiredRule"
            hide-details="auto"
            label="Modulkürzel"
            min-width="150px"
            validate-on="input"
            autofocus
            required
          />
        </div>
      </template>
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.title.en"
              label="Titel (Englisch)"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.title.de"
              label="Titel (Deutsch)"
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.editorUsername"
              label="Nutzername des Bearbeiters"
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.semesterHours"
              label="Semesterstunden"
              type="number"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.creditPoints"
              label="Credit Points"
              type="number"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.varyingCP"
              label="Variierende CP"
              required
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="formData.lecturers"
              label="Dozenten"
              required
            />
          </VCol>
          <VCol>
            <VTextarea
              v-model="formData.extraInfo"
              label="Zusätzliche Informationen"
              hide-details
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis">
          Dozentenliste mit Kommas getrennt
        </small>
        <br />
        <small
          v-if="!formData.title.de && !formData.title.en"
          class="text-caption"
          style="color: rgb(var(--v-theme-primary))"
        >
          Mindestens ein Titel ist erforderlich
        </small>
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn text="Abbrechen" @click="$emit('cancel')" />
        <VSpacer />
        <VSwitch
          v-if="props.onTheFly !== true"
          v-model="formData.published"
          color="primary"
          label="veröffentlicht"
          hide-details
        />
        <VBtn
          v-if="selectedSubject?.moduleCode"
          text="Löschen"
          @click="deleteSubject"
        />
        <VBtn
          :disabled="
            !formData.moduleCode || (!formData.title.de && !formData.title.en)
          "
          text="Speichern"
          @click="submit"
        />
      </template>
    </VCard>
  </VDialog>
</template>
