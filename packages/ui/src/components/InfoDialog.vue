<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const showInfoDialog = defineModel<boolean>()
const { t } = useI18n()
</script>

<template>
  <VDialog v-model:model-value="showInfoDialog" max-width="800">
    <VCard>
      <VCardTitle>
        {{ t('info-title') }}
      </VCardTitle>
      <VCardText>
        Lorem ipsum dolor sit amet, semper quis, sapien id natoque elit. Nostra
        urna at, magna at neque sed sed ante imperdiet, dolor mauris cursus
        velit, velit non, sem nec. Volutpat sem ridiculus placerat leo, augue
        in, duis erat proin condimentum in a eget, sed fermentum sed vestibulum
        varius ac, vestibulum volutpat orci ut elit eget tortor. Ultrices
        nascetur nulla gravida ante arcu. Pharetra rhoncus morbi ipsum, nunc
        tempor debitis, ipsum pellentesque, vitae id quam ut mauris dui tempor,
        aptent non. Quisque turpis. Phasellus quis lectus luctus orci eget
        rhoncus. Amet donec vestibulum mattis commodo, nulla aliquet, nibh
        praesent, elementum nulla. Sit lacus pharetra tempus magna neque
        pellentesque, nulla vel erat.

        <br />

        Justo ex quisque nulla accusamus venenatis, sed quis. Nibh phasellus
        gravida metus in, fusce aenean ut erat commodo eros. Ut turpis, dui
        integer, nonummy pede placeat nec in sit leo. Faucibus porttitor illo
        taciti odio, amet viverra scelerisque quis quis et tortor, curabitur
        morbi a. Enim tempor at, rutrum elit condimentum, amet rutrum vitae
        tempor torquent nunc. Praesent vestibulum integer maxime felis. Neque
        aenean quia vitae nostra, tempus elit enim id dui, at egestas pulvinar.
        Integer libero vestibulum, quis blandit scelerisque mattis fermentum
        nulla, tortor donec vestibulum dolor amet eget, elit nullam. Aliquam leo
        phasellus aliquam curabitur metus a, nulla justo mattis duis interdum
        vel, mollis vitae et id, vestibulum erat ridiculus sit pulvinar justo
        sed. Vehicula convallis, et nulla wisi, amet vestibulum risus, quam ac
        egestas.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          :text="t('info-close')"
          variant="text"
          @click="showInfoDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
  info-title: Explanation
  info-close: Close

de:
  info-title: Erklärung
  info-close: Schliessen
</i18n>
