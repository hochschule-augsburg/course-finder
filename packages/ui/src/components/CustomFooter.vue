<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VBtn, VFooter, VRow } from 'vuetify/components'

const { t } = useI18n()
</script>

<template>
  <VFooter class="custom-footer" color="secondary">
    <VRow justify="center" no-gutters>
      <VBtn
        class="mx-2"
        color="primary"
        to="imprint"
        rounded="xl"
        variant="text"
      >
        {{ t('imprint') }}
      </VBtn>
      <VBtn class="mx-2" color="primary" rounded="xl" to="gdpr" variant="text">
        {{ t('gdpr') }}
      </VBtn>
    </VRow>
  </VFooter>
</template>

<style scoped lang="scss">
.custom-footer {
  max-height: 3rem;
}
</style>

<i18n lang="yaml">
en:
  imprint: imprint
  gdpr: Data Privacy
de:
  imprint: Impressum
  gdpr: Datenschutz
</i18n>
