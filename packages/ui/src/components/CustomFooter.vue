<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VBtn, VFooter, VRow } from 'vuetify/components'

const { t } = useI18n()
</script>

<template>
  <VFooter class="custom-footer" color="rgb(var(--v-theme-secondary))">
    <VRow justify="center" no-gutters>
      <VBtn
        class="mx-2"
        color="black"
        href="https://www.tha.de/Service/Impressum.html"
        rounded="xl"
        target="_blank"
        variant="text"
      >
        {{ t('imprint') }}
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
de:
  imprint: Impressum
</i18n>
