import { defineComponent, ref } from 'vue'
import { VAlert, VOverlay } from 'vuetify/components'

type AlertProps = InstanceType<typeof VAlert>['$props']

export type AlertOptions = { duration?: number } & Pick<
  AlertProps,
  'color' | 'text' | 'title' | 'width'
>

let alert: { show: (options: AlertOptions) => void } | undefined

export const alertService = {
  show(options: AlertOptions) {
    alert?.show(options)
  },
}

export const ServiceAlert = defineComponent(
  () => {
    const alertOptions = ref<AlertOptions>()
    const show = ref(false)
    alert = {
      show: (options) => {
        alertOptions.value = options
        show.value = true
        setTimeout(() => {
          show.value = false
        }, options.duration ?? 1000)
      },
    }

    if (import.meta.hot) {
      import.meta.hot.invalidate()
    }
    return () => (
      <VOverlay
        activator="parent"
        modelValue={show.value}
        origin="center center"
        scrim={false}
        style={{
          alignItems: 'end',
          justifyContent: 'left',
          padding: '0.5rem',
        }}
        zIndex={3000}
      >
        <VAlert {...alertOptions.value} maxWidth={500} />
      </VOverlay>
    )
  },
  { name: 'ServiceAlert' },
)
