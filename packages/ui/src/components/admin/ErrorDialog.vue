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
    max-width="60rem"
    @update:model-value="$emit('close')"
  >
    <VCard>
      <VCardTitle> Fehler </VCardTitle>
      <VCardText class="error-text">
        {{ props.message }}
      </VCardText>
      <VCardActions>
        <VBtn @click="emits('close')"> Schließen </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.error-text {
  white-space: pre-wrap;
  overflow-y: auto;
}
</style>
