import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDialog,
  VRow,
} from 'vuetify/components'

export type DialogOptions = {
  onCancel: () => void
  onConfirm: () => void
  // translated
  text: string
  // translated
  title: string
}

let dialog: { open: (options: DialogOptions) => void } | undefined

export const dialogService = {
  showDialog(options: DialogOptions) {
    dialog?.open(options)
  },
}

export const ModalDialog = defineComponent(() => {
  const dialogOptions = ref<DialogOptions | undefined>()
  const { t } = useI18n()

  dialog = {
    open: (options) => {
      dialogOptions.value = options
    },
  }

  function cancel() {
    dialogOptions.value?.onCancel()
    dialogOptions.value = undefined
  }

  function confirm() {
    dialogOptions.value?.onConfirm()
    dialogOptions.value = undefined
  }
  return () => (
    <VDialog
      max-width="400"
      modelValue={!!dialogOptions.value}
      onUpdate:modelValue={cancel}
    >
      <VCard>
        <VCardTitle class="headline">
          {t(dialogOptions.value?.title ?? '')}
        </VCardTitle>
        <VCardText> {t(dialogOptions.value?.text ?? '')} </VCardText>
        <VCardActions>
          <VRow align="end" justify="end">
            <VBtn
              color="error"
              // @ts-expect-error wrong typing
              onClick={cancel}
            >
              {t('cancel')}
            </VBtn>
            <VBtn
              color="success"
              // @ts-expect-error wrong typing
              onClick={confirm}
            >
              {t('confirm')}
            </VBtn>
          </VRow>
        </VCardActions>
      </VCard>
    </VDialog>
  )
})
