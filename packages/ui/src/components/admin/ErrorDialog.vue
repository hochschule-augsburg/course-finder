<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { VCard, VCardActions, VCardText, VDialog } from 'vuetify/components'

const props = defineProps<{
  message: string
  visible: boolean
}>()
const emits = defineEmits<{
  close: []
}>()
const { t } = useI18n()
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="600px"
    @update:model-value="$emit('close')"
  >
    <VCard>
      <VCardTitle>
        {{ t('title') }}
      </VCardTitle>
      <VCardText>
        {{ message }}
      </VCardText>
      <VCardActions>
        <VCardSpacer />
        <VBtn @click="emits('close')">
          {{ t('close') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
  title: Error
  close: Close
de:
  title: Fehler
  close: Schließen
</i18n>
