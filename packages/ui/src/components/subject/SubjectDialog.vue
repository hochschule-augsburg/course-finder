<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { mdiLink } from '@mdi/js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import {
  VBtn,
  VCard,
  VCardTitle,
  VDialog,
  VIcon,
  VSnackbar,
  VSpacer,
  VTooltip,
} from 'vuetify/components'

defineProps<{
  subject?: Subject
}>()
const showSubjectDialog = defineModel<boolean>('visible')
const { locale, t } = useI18n()
const route = useRoute()

const { mobile} = useDisplay()

const showLinkCopied = ref(false)

async function copyLinkToClipboard() {
  await navigator.clipboard.writeText(`${window.origin}${route.fullPath}`)
  showLinkCopied.value = true
}
</script>

<template>
  <VDialog v-model:model-value="showSubjectDialog" max-width="750" :fullscreen="mobile">
    <VCard v-if="subject" class="pa-3" color="background" :style="mobile ? 'height: 100vh; display: flex;' : undefined">
      <VCardTitle class="px-2">
        <div class="d-flex align-center">
          <span class="wrap-ellipsis">
            <strong>
              {{ subject.title[locale] }}
            </strong>
          </span>
          <VSpacer />
          <VBtn
            class="copy-link-button flex-shrink-0"
            color="primary"
            variant="text"
            icon
            @click="copyLinkToClipboard"
          >
            <VIcon :icon="mdiLink" />
            <VTooltip activator="parent" location="bottom right">
              {{ t('copy-link') }}
            </VTooltip>
            <VSnackbar
              v-model="showLinkCopied"
              activator="parent"
              color="secondary"
              content-class="subject-dialog-copy-snackbar-content"
              location="bottom left"
              rounded="pill"
              timeout="500"
            >
              {{ t('link-copied') }}
            </VSnackbar>
          </VBtn>
        </div>
      </VCardTitle>
      <VCardText class="pa-0 pb-3 px-2" style="overflow-y: auto; flex: 1;">
        <SubjectDetails :subject="subject" />
      </VCardText>

      <VCardActions class="px-2">
        <VSpacer />
        <VBtn
          :text="t('global.close')"
          color="primary"
          variant="tonal"
          @click="showSubjectDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.wrap-ellipsis {
  white-space: wrap;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
</style>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.subject-dialog-copy-snackbar-content {
  min-width: 1rem;
}
</style>

<i18n lang="yaml">
en:
  copy-link: Copy link
  link-copied: Link copied to clipboard
de:
  copy-link: Link kopieren
  link-copied: Link kopiert
</i18n>
