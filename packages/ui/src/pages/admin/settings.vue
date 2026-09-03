<script lang="ts" setup>
import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { debounce } from 'lodash-es'
import { ref } from 'vue'
import { watch } from 'vue'

import { useAppConfStore } from '@/stores/AppConfStore'

const appConfigStore = useAppConfStore()

const formData = ref<AppConf>()

watch(
  () => appConfigStore.conf,
  (newVal) => {
    if (newVal) {
      formData.value = {
        ...newVal,
        allowedEnrollmentEmails: newVal.allowedEnrollmentEmails ?? [],
        mailReceivers: newVal.mailReceivers ?? [],
      }
    }
  },
  { immediate: true },
)

const emailRules = [
  (v: string[] | undefined) =>
    !v ||
    v.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    'Bitte gültige E-Mail-Adressen eingeben',
]

const update = debounce(async () => {
  if (!formData.value) return
  await appConfigStore.update({
    allowedEnrollmentEmails:
      formData.value.allowedEnrollmentEmails?.filter(Boolean),
    mailReceivers: formData.value.mailReceivers?.filter(Boolean),
    maxCredits: formData.value.maxCredits,
  })
})
</script>

<template>
  <VContainer>
    <VRow>
      <VCol>
        <h1>Einstellungen</h1>
      </VCol>
    </VRow>
    <VForm v-if="formData">
      <VRow dense>
        <VCol cols="12" md="4" sm="6">
          <VTextField
            v-model.number="formData.maxCredits"
            label="Maximale Credits"
            @update:model-value="update"
          />
          <small class="text-caption">Gilt nur für neue Eingaben.</small>
        </VCol>
        <VCol cols="12" md="8" sm="12">
          <VCombobox
            v-model="formData.mailReceivers"
            chips
            closable-chips
            clearable
            hint="Empfänger für allgemeine Ankündigungen (z. B. Semesterverteiler)"
            label="E-Mail-Empfänger (Mailinglisten)"
            multiple
            persistent-hint
            :rules="emailRules"
            @update:model-value="update"
          />
        </VCol>
        <VCol cols="12">
          <VCombobox
            v-model="formData.allowedEnrollmentEmails"
            chips
            closable-chips
            clearable
            hint="Studierende mit diesen E-Mail-Adressen dürfen sich unabhängig vom Fachsemester einschreiben"
            label="E-Mail-Ausnahmen für Einschreibung"
            multiple
            persistent-hint
            :rules="emailRules"
            @update:model-value="update"
          />
        </VCol>
        <VCol cols="12" class="mt-2">
          <VCard variant="outlined">
            <VCardItem>
              <template #title>
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2"
                >
                  <span>Künstliche Intelligenz (Google Gemini)</span>
                  <VChip
                    size="small"
                    :color="
                      appConfigStore.conf?.hasAiApiKey ? 'success' : 'grey'
                    "
                  >
                    {{
                      appConfigStore.conf?.hasAiApiKey
                        ? 'Konfiguriert (Server)'
                        : 'Optional (Nicht konfiguriert)'
                    }}
                  </VChip>
                </div>
              </template>
            </VCardItem>
            <VCardText>
              <p class="text-body-2 text-medium-emphasis">
                Der <code>AI_API_KEY</code> ist vollkommen optional. Er wird
                ausschließlich für das automatisierte Einlesen und Zuordnen von
                angebotenen Kursen aus WPF-Excel-Dateien verwendet. Alle übrigen
                Funktionen stehen uneingeschränkt zur Verfügung.
              </p>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VForm>
  </VContainer>
</template>
