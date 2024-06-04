import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDialog,
  VSpacer,
} from 'vuetify/components'

export type DialogOptions = {
  onCancel: () => void
  onConfirm: () => void
  text: string
  title: string
}

let dialog: { open: (options: DialogOptions) => void } | undefined

export const dialogService = {
  showDialog(options: DialogOptions) {
    dialog?.open(options)
  },
}
export const ModalDialog = defineComponent(
  () => {
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

    if (import.meta.hot) {
      import.meta.hot.invalidate()
    }
    return () => (
      <VDialog
        max-width="400"
        modelValue={!!dialogOptions.value}
        onUpdate:modelValue={cancel}
      >
        <VCard>
          <VCardTitle class="headline">{dialogOptions.value?.title}</VCardTitle>
          <VCardText> {dialogOptions.value?.text} </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn
              // @ts-expect-error wrong typing
              onClick={cancel}
              variant="plain"
            >
              {t('global.cancel')}
            </VBtn>
            <VBtn
              color="primary"
              // @ts-expect-error wrong typing
              onClick={confirm}
              variant="tonal"
            >
              {t('global.confirm')}
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    )
  },
  { name: 'ModalDialog' },
)
