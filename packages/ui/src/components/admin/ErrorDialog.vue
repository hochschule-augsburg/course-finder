<script lang="ts" setup>
import { VCard, VCardActions, VCardText, VDialog } from 'vuetify/components'

const props = defineProps<{
  message: string
  visible: boolean
}>()
const emits = defineEmits<{
  close: []
}>()
</script>

<template>
  <VDialog
    :model-value="props.visible"
    max-width="600px"
    @update:model-value="$emit('close')"
  >
    <VCard>
      <VCardTitle> Fehler </VCardTitle>
      <VCardText>
        {{ props.message }}
      </VCardText>
      <VCardActions>
        <VBtn @click="emits('close')"> Schließen </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
